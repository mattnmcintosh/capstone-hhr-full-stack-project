from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from models import db, User, ChecklistItem, Event

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins=[Config.CLIENT_ORIGIN])
db.init_app(app)

with app.app_context():
    db.create_all()

# --- CHECKLIST ITEM CRUD ROUTES ---

@app.route('/api/users/<int:user_id>/items', methods=['GET'])
def get_items(user_id):
    items = ChecklistItem.query.filter_by(user_id=user_id).all()
    # Sort descending by calculated double priority score
    sorted_items = sorted(items, key=lambda x: x.calculate_priority_score(), reverse=True)
    return jsonify([item.to_dict() for item in sorted_items]), 200

@app.route('/api/users/<int:user_id>/items', methods=['POST'])
def create_item(user_id):
    data = request.get_json()
    due_date = datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
    
    new_item = ChecklistItem(
        user_id=user_id,
        title=data.get('title'),
        due_date=due_date
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

@app.route('/api/items/<int:item_id>', methods=['PATCH'])
def update_item(item_id):
    item = ChecklistItem.query.get_or_404(item_id)
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
def delete_item(item_id):
    item = ChecklistItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return '', 204

if __name__ == '__main__':
    app.run(port=5555, debug=app.config["FLASK_DEBUG"])