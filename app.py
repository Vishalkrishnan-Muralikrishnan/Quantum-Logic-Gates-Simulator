from flask import Flask, render_template, request, jsonify
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

app = Flask(__name__)
simulator = AerSimulator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/run', methods=['POST'])
def run_circuit():
    data = request.get_json()
    gates = data.get('circuit', [])
    num_qubits = 2
    qc = QuantumCircuit(num_qubits)
    
    # Add gates dynamically
    for gate in gates:
        g = gate['type']
        q = gate['qubits']
        if g == 'H': qc.h(q[0])
        elif g == 'X': qc.x(q[0])
        elif g == 'Y': qc.y(q[0])
        elif g == 'Z': qc.z(q[0])
        elif g == 'S': qc.s(q[0])
        elif g == 'T': qc.t(q[0])
        elif g == 'CNOT': qc.cx(q[0], q[1])
        elif g == 'SWAP': qc.swap(q[0], q[1])
    
    qc.measure_all()
    job = simulator.run(qc, shots=1000)
    result = job.result()
    counts = result.get_counts()
    
    probs = []
    for i in range(num_qubits):
        prob = sum([v for k,v in counts.items() if k[num_qubits-1-i]=='1'])/1000
        probs.append(prob)
    
    return jsonify({'probabilities': probs})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
