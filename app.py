from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

FILE_RIWAYAT = "riwayat_game.json"
FILE_PERTANYAAN = "pertanyaan.json"

# ============================================
# FUNGSI MANAJEMEN PERTANYAAN
# ============================================

def load_pertanyaan():
    """Load pertanyaan dari file JSON"""
    try:
        if os.path.exists(FILE_PERTANYAAN):
            with open(FILE_PERTANYAAN, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    print(f"✅ Loaded {len(data)} questions from {FILE_PERTANYAAN}")
                    return data
    except Exception as e:
        print(f"Error loading questions: {e}")
    
    print("⚠️ File pertanyaan.json tidak ditemukan, membuat default...")
    default = get_default_questions()
    save_pertanyaan(default)
    return default

def get_default_questions():
    """Pertanyaan default"""
    return [
        {"id": 1, "pertanyaan": "Apa ibu kota Indonesia?", "pilihan": ["Jakarta", "Bandung", "Surabaya", "Medan"], "jawaban": 0},
        {"id": 2, "pertanyaan": "Siapa presiden pertama Indonesia?", "pilihan": ["Soeharto", "Soekarno", "Habibie", "Megawati"], "jawaban": 1},
        {"id": 3, "pertanyaan": "Berapakah 7 x 8?", "pilihan": ["48", "56", "64", "72"], "jawaban": 1},
        {"id": 4, "pertanyaan": "Apa nama planet terbesar di tata surya?", "pilihan": ["Saturnus", "Jupiter", "Neptunus", "Uranus"], "jawaban": 1},
        {"id": 5, "pertanyaan": "Bahasa pemrograman apa yang digunakan untuk web?", "pilihan": ["Java", "Python", "JavaScript", "C++"], "jawaban": 2},
        {"id": 6, "pertanyaan": "Berapa jumlah kaki pada laba-laba?", "pilihan": ["6", "8", "10", "12"], "jawaban": 1},
        {"id": 7, "pertanyaan": "Apa nama gunung tertinggi di dunia?", "pilihan": ["Everest", "Kilimanjaro", "Elbrus", "K2"], "jawaban": 0},
        {"id": 8, "pertanyaan": "Siapa penemu lampu pijar?", "pilihan": ["Tesla", "Edison", "Einstein", "Newton"], "jawaban": 1},
        {"id": 9, "pertanyaan": "Apa hasil akar kuadrat 144?", "pilihan": ["10", "11", "12", "13"], "jawaban": 2},
        {"id": 10, "pertanyaan": "Apa warna bendera Indonesia?", "pilihan": ["Merah-Putih", "Merah-Kuning", "Putih-Biru", "Hijau-Putih"], "jawaban": 0},
        {"id": 11, "pertanyaan": "Hewan apa yang disebut 'raja hutan'?", "pilihan": ["Harimau", "Singa", "Gajah", "Beruang"], "jawaban": 1},
        {"id": 12, "pertanyaan": "Samudra terluas di dunia?", "pilihan": ["Atlantik", "Pasifik", "Hindia", "Arktik"], "jawaban": 1},
        {"id": 13, "pertanyaan": "Siapa penulis 'Laskar Pelangi'?", "pilihan": ["Andrea Hirata", "Tere Liye", "Dee Lestari", "Habiburrahman"], "jawaban": 0},
        {"id": 14, "pertanyaan": "Apa lambang kimia untuk air?", "pilihan": ["H2O", "CO2", "NaCl", "HCl"], "jawaban": 0},
        {"id": 15, "pertanyaan": "Berapa jumlah planet di tata surya?", "pilihan": ["7", "8", "9", "10"], "jawaban": 1},
        {"id": 16, "pertanyaan": "Siapa pahlawan proklamasi Indonesia?", "pilihan": ["Soekarno-Hatta", "Soeharto", "Habibie", "Megawati"], "jawaban": 0},
        {"id": 17, "pertanyaan": "Apa ibukota Jepang?", "pilihan": ["Seoul", "Beijing", "Tokyo", "Bangkok"], "jawaban": 2},
        {"id": 18, "pertanyaan": "Berapa jumlah sudut pada segitiga?", "pilihan": ["90", "180", "270", "360"], "jawaban": 1},
        {"id": 19, "pertanyaan": "Apa nama hewan tercepat di darat?", "pilihan": ["Singa", "Cheetah", "Harimau", "Kuda"], "jawaban": 1},
        {"id": 20, "pertanyaan": "Siapa penemu telepon?", "pilihan": ["Alexander Graham Bell", "Thomas Edison", "Nikola Tesla", "Albert Einstein"], "jawaban": 0}
    ]

def save_pertanyaan(data):
    try:
        with open(FILE_PERTANYAAN, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving questions: {e}")
        return False

def get_next_id():
    pertanyaan = load_pertanyaan()
    if not pertanyaan:
        return 1
    max_id = max([q.get('id', 0) for q in pertanyaan])
    return max_id + 1

# ============================================
# FUNGSI MANAJEMEN RIWAYAT
# ============================================

def load_riwayat():
    try:
        if os.path.exists(FILE_RIWAYAT):
            with open(FILE_RIWAYAT, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        return []
    except Exception as e:
        print(f"Error loading riwayat: {e}")
        return []

def save_riwayat(riwayat):
    try:
        with open(FILE_RIWAYAT, 'w', encoding='utf-8') as f:
            json.dump(riwayat, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving riwayat: {e}")
        return False

# ============================================
# ROUTES
# ============================================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/pertanyaan')
def get_pertanyaan():
    pertanyaan = load_pertanyaan()
    if len(pertanyaan) < 5:
        return jsonify(pertanyaan)
    try:
        return jsonify(random.sample(pertanyaan, 5))
    except:
        return jsonify(pertanyaan[:5])

@app.route('/api/riwayat', methods=['GET', 'POST'])
def handle_riwayat():
    if request.method == 'GET':
        return jsonify(load_riwayat())
    elif request.method == 'POST':
        try:
            data = request.json
            if not data:
                return jsonify({"status": "error", "message": "Data kosong"}), 400
            
            data['tanggal'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            riwayat = load_riwayat()
            riwayat.append(data)
            
            if save_riwayat(riwayat):
                return jsonify({"status": "success", "message": "Riwayat tersimpan"})
            else:
                return jsonify({"status": "error", "message": "Gagal menyimpan"}), 500
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/riwayat/reset', methods=['POST'])
def reset_riwayat():
    try:
        if os.path.exists(FILE_RIWAYAT):
            os.remove(FILE_RIWAYAT)
        save_riwayat([])
        return jsonify({"status": "success", "message": "Riwayat direset!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/leaderboard')
def get_leaderboard():
    riwayat = load_riwayat()
    
    stats = {}
    for entry in riwayat:
        nama = entry.get('nama', 'Unknown')
        if nama not in stats:
            stats[nama] = {
                'total_main': 0, 'menang': 0, 'kalah': 0,
                'total_skor': 0, 'skor_tertinggi': 0,
                'total_benar': 0, 'total_salah': 0, 'rata_rata_benar': 0
            }
        
        stats[nama]['total_main'] += 1
        if entry.get('menang', False):
            stats[nama]['menang'] += 1
        else:
            stats[nama]['kalah'] += 1
        
        skor = entry.get('skor', 0)
        stats[nama]['total_skor'] += skor
        if skor > stats[nama]['skor_tertinggi']:
            stats[nama]['skor_tertinggi'] = skor
        
        stats[nama]['total_benar'] += entry.get('benar', 0)
        stats[nama]['total_salah'] += entry.get('salah', 0)
    
    for nama in stats:
        total = stats[nama]['total_benar'] + stats[nama]['total_salah']
        if total > 0:
            stats[nama]['rata_rata_benar'] = round((stats[nama]['total_benar'] / total) * 100, 1)
    
    return jsonify({
        'peringkat_menang': sorted(
            [{'nama': n, 'menang': s['menang'], 'total_main': s['total_main']} 
             for n, s in stats.items() if s['menang'] > 0],
            key=lambda x: x['menang'], reverse=True
        )[:10],
        'peringkat_skor': sorted(
            [{'nama': n, 'skor_tertinggi': s['skor_tertinggi'], 'total_main': s['total_main']} 
             for n, s in stats.items() if s['skor_tertinggi'] > 0],
            key=lambda x: x['skor_tertinggi'], reverse=True
        )[:10],
        'peringkat_kuis': sorted(
            [{'nama': n, 'benar': s['total_benar'], 'salah': s['total_salah'], 
              'rata_rata': s['rata_rata_benar']} 
             for n, s in stats.items() if s['total_benar'] > 0 or s['total_salah'] > 0],
            key=lambda x: x['benar'], reverse=True
        )[:10]
    })

# ============================================
# ADMIN PERTANYAAN - CRUD
# ============================================

@app.route('/api/admin/pertanyaan', methods=['GET'])
def admin_get_pertanyaan():
    return jsonify(load_pertanyaan())

@app.route('/api/admin/pertanyaan', methods=['POST'])
def admin_add_pertanyaan():
    try:
        data = request.json
        if not data.get('pertanyaan') or not data.get('pilihan') or data.get('jawaban') is None:
            return jsonify({"status": "error", "message": "Data tidak lengkap"}), 400
        
        if len(data['pilihan']) != 4:
            return jsonify({"status": "error", "message": "Harus ada 4 pilihan"}), 400
        
        pertanyaan = load_pertanyaan()
        new_question = {
            "id": get_next_id(),
            "pertanyaan": data['pertanyaan'].strip(),
            "pilihan": [p.strip() for p in data['pilihan']],
            "jawaban": int(data['jawaban'])
        }
        pertanyaan.append(new_question)
        
        if save_pertanyaan(pertanyaan):
            return jsonify({
                "status": "success",
                "message": f"Pertanyaan ditambahkan! Total: {len(pertanyaan)}",
                "total": len(pertanyaan)
            })
        return jsonify({"status": "error", "message": "Gagal menyimpan"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/pertanyaan/<int:question_id>', methods=['PUT'])
def admin_update_pertanyaan(question_id):
    try:
        data = request.json
        pertanyaan = load_pertanyaan()
        
        index = None
        for i, q in enumerate(pertanyaan):
            if q.get('id') == question_id:
                index = i
                break
        
        if index is None:
            return jsonify({"status": "error", "message": "Pertanyaan tidak ditemukan"}), 404
        
        if data.get('pertanyaan'):
            pertanyaan[index]['pertanyaan'] = data['pertanyaan'].strip()
        if data.get('pilihan') and len(data['pilihan']) == 4:
            pertanyaan[index]['pilihan'] = [p.strip() for p in data['pilihan']]
        if data.get('jawaban') is not None:
            pertanyaan[index]['jawaban'] = int(data['jawaban'])
        
        if save_pertanyaan(pertanyaan):
            return jsonify({"status": "success", "message": "Pertanyaan diupdate!"})
        return jsonify({"status": "error", "message": "Gagal menyimpan"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/pertanyaan/<int:question_id>', methods=['DELETE'])
def admin_delete_pertanyaan(question_id):
    try:
        pertanyaan = load_pertanyaan()
        
        index = None
        for i, q in enumerate(pertanyaan):
            if q.get('id') == question_id:
                index = i
                break
        
        if index is None:
            return jsonify({"status": "error", "message": "Pertanyaan tidak ditemukan"}), 404
        
        deleted = pertanyaan.pop(index)
        
        if save_pertanyaan(pertanyaan):
            return jsonify({
                "status": "success",
                "message": f"'{deleted['pertanyaan']}' dihapus",
                "total": len(pertanyaan)
            })
        return jsonify({"status": "error", "message": "Gagal menyimpan"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/pertanyaan/reset', methods=['POST'])
def admin_reset_pertanyaan():
    try:
        if save_pertanyaan(get_default_questions()):
            return jsonify({
                "status": "success",
                "message": "Pertanyaan direset ke default!",
                "total": len(get_default_questions())
            })
        return jsonify({"status": "error", "message": "Gagal reset"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    if not os.path.exists(FILE_PERTANYAAN):
        save_pertanyaan(get_default_questions())
        print(f"✅ Created {FILE_PERTANYAAN}")
    
    if not os.path.exists(FILE_RIWAYAT):
        save_riwayat([])
        print(f"✅ Created {FILE_RIWAYAT}")
    
    print("\n" + "="*50)
    print("🐍 SNAKE GAME SERVER")
    print("="*50)
    print(f"📁 Pertanyaan: {os.path.abspath(FILE_PERTANYAAN)}")
    print(f"📁 Riwayat: {os.path.abspath(FILE_RIWAYAT)}")
    print(f"📝 Total pertanyaan: {len(load_pertanyaan())}")
    print("🔑 Admin: admin / admin123")
    print("🌐 http://localhost:5000")
    print("="*50 + "\n")
    
    app.run(debug=True, port=5000)