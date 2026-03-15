from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Frontend থেকে request accept করার জন্য

# ── Simple file-based storage (database ছাড়া) ──
HISTORY_FILE = 'history.json'

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    return []

def save_history(data):
    with open(HISTORY_FILE, 'w') as f:
        json.dump(data, f, indent=2)


# ══════════════════════════════════════════
#  ROUTES
# ══════════════════════════════════════════

# Health check
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'running',
        'message': 'CPU Scheduler Backend is running!',
        'version': '1.0'
    })


# Simulation result save করো
@app.route('/api/save', methods=['POST'])
def save_simulation():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    history = load_history()
    entry = {
        'id': len(history) + 1,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'algorithm': data.get('algorithm', 'Unknown'),
        'processes': data.get('processes', []),
        'stats': data.get('stats', {}),
    }
    history.insert(0, entry)

    # শুধু last 50 টা রাখো
    history = history[:50]
    save_history(history)

    return jsonify({'success': True, 'id': entry['id'], 'message': 'Simulation saved!'})


# সব history দেখো
@app.route('/api/history', methods=['GET'])
def get_history():
    history = load_history()
    return jsonify({'history': history, 'count': len(history)})


# নির্দিষ্ট simulation দেখো
@app.route('/api/history/<int:sim_id>', methods=['GET'])
def get_simulation(sim_id):
    history = load_history()
    result = next((h for h in history if h['id'] == sim_id), None)
    if not result:
        return jsonify({'error': 'Simulation not found'}), 404
    return jsonify(result)


# History clear করো
@app.route('/api/history/clear', methods=['DELETE'])
def clear_history():
    save_history([])
    return jsonify({'success': True, 'message': 'History cleared!'})


# ══════════════════════════════════════════
#  RUN
# ══════════════════════════════════════════
if __name__ == '__main__':
    print("=" * 40)
    print("  CPU Scheduler Backend Running!")
    print("  URL: http://localhost:5000")
    print("=" * 40)
    app.run(debug=True, port=5000)
