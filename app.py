from flask import Flask, render_template, request, jsonify
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import os

app = Flask(__name__)
sim = AerSimulator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/simulate', methods=['POST'])
def simulate():
    data = request.get_json()
    num_qubits = data.get('num_qubits', 2)
    gates = data.get('gates', [])  # list of {type, qubits, time}

    qc = QuantumCircuit(num_qubits)
    for g in sorted(gates, key=lambda x: x['time']):
        t = g['type']
        qs = g['qubits']
        if t == 'H':
            qc.h(qs[0])
        elif t == 'X':
            qc.x(qs[0])
        elif t == 'Z':
            qc.z(qs[0])
        elif t == 'CNOT':
            if len(qs) == 2:
                qc.cx(qs[0], qs[1])
        # Add more gates here

    qc.measure_all()
    job = sim.run(qc, shots=1000)
    result = job.result()
    counts = result.get_counts()

    probs = []
    for i in range(num_qubits):
        p1 = sum(v for k, v in counts.items() if k[num_qubits - 1 - i] == '1')
        probs.append(p1 / 1000)

    return jsonify({'probabilities': probs})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
