from datetime import datetime
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from icalendar import Calendar, Event as ICalEvent
from config import Config
from models import db, User, ChecklistItem, Event
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins=[Config.CLIENT_ORIGIN])
db.init_app(app)

bcrypt = Bcrypt(app)

jwt = JWTManager(app)

with app.app_context():
    db.create_all()

@app.route('/api/items', methods=['GET'])
@jwt_required()
def get_items():
    current_user_id = get_jwt_identity()
    items = ChecklistItem.query.filter_by(user_id=current_user_id).all()
    sorted_items = sorted(items, key=lambda x: x.calculate_priority_score(), reverse=True)
    return jsonify([item.to_dict() for item in sorted_items]), 200

@app.route('/api/items', methods=['POST'])
@jwt_required()
def create_item():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    due_date = datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
    
    new_item = ChecklistItem(
        user_id=current_user_id,
        title=data.get('title'),
        due_date=due_date
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

@app.route('/api/items/<int:item_id>', methods=['PATCH'])
@jwt_required()
def update_item(item_id):
    current_user_id = get_jwt_identity()
    # Ensure the item belongs to the logged-in user
    item = ChecklistItem.query.filter_by(id=item_id, user_id=current_user_id).first_or_404()
    data = request.get_json()
    
    if 'title' in data:
        item.title = data['title']
    if 'is_completed' in data:
        item.is_completed = data['is_completed']
    if 'due_date' in data:
        item.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
        
    db.session.commit()
    return jsonify(item.to_dict()), 200

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    current_user_id = get_jwt_identity()
    item = ChecklistItem.query.filter_by(id=item_id, user_id=current_user_id).first_or_404()
    db.session.delete(item)
    db.session.commit()
    return '', 204

@app.route('/api/events', methods=['GET'])
@jwt_required()
def get_events():
    current_user_id = get_jwt_identity()
    events = Event.query.filter_by(user_id=current_user_id).all()
    return jsonify([event.to_dict() for event in events]), 200

@app.route('/api/events', methods=['POST'])
@jwt_required()
def create_event():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    new_event = Event(
        user_id=current_user_id,
        title=data.get('title'),
        start_time=datetime.fromisoformat(data['start_time']),
        end_time=datetime.fromisoformat(data['end_time']),
        description=data.get('description', '')
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify(new_event.to_dict()), 201

@app.route('/api/events/<int:event_id>', methods=['PATCH'])
@jwt_required()
def update_event(event_id):
    current_user_id = get_jwt_identity()
    event = Event.query.filter_by(id=event_id, user_id=current_user_id).first_or_404()
    data = request.get_json()
    
    if 'title' in data:
        event.title = data['title']
    if 'start_time' in data:
        event.start_time = datetime.fromisoformat(data['start_time'])
    if 'end_time' in data:
        event.end_time = datetime.fromisoformat(data['end_time'])
    if 'description' in data:
        event.description = data['description']
        
    db.session.commit()
    return jsonify(event.to_dict()), 200

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    current_user_id = get_jwt_identity()
    event = Event.query.filter_by(id=event_id, user_id=current_user_id).first_or_404()
    db.session.delete(event)
    db.session.commit()
    return '', 204

@app.route('/api/calendar.ics', methods=['GET'])
def export_ics():
    
    token = request.args.get('token')
    if not token:
        return jsonify({"error": "Missing token parameter"}), 401
    
    try:
        decoded_token = decode_token(token)
        current_user_id = decoded_token['sub']
    except Exception:
        return jsonify({"error": "Invalid or expired token"}), 401

    user = User.query.get_or_404(current_user_id)
    cal = Calendar()
    cal.add('prodid', '-//Event Calendar//EN')
    cal.add('version', '2.0')
    cal.add('calscale', 'GREGORIAN')
    cal.add('method', 'PUBLISH')

    for event in user.events:
        e = ICalEvent()
        e.add('summary', event.title)
        e.add('dtstart', event.start_time)
        e.add('dtend', event.end_time)
        e.add('description', event.description or '')
        cal.add_component(e)

    for item in user.checklist_items:
        if item.due_date and not item.is_completed:
            e = ICalEvent()
            e.add('summary', f"[Queue Deadline] {item.title}")
            e.add('dtstart', item.due_date)
            e.add('dtend', item.due_date)
            e.add('description', "")
            cal.add_component(e)

    return Response(
        cal.to_ical(),
        mimetype='text/calendar',
        headers={"Content-Disposition": "attachment; filename=schedule.ics"}
    )

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409

    new_user = User(username=username)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.to_dict()), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()

    if user and user.check_password(data.get('password')):
        # Create a JWT token containing the user id as identity
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token, user=user.to_dict()), 200

    return jsonify({"error": "Invalid username or password"}), 401

if __name__ == '__main__':
    app.run(port=5555, debug=app.config["FLASK_DEBUG"])