let gates = [];
let dragGate = null;
let probChart = null;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.gate-tile').forEach(t => {
    t.addEventListener('dragstart', ev => {
      dragGate = ev.target.dataset.gate;
      ev.dataTransfer.setData('text/plain', '');
    });
  });

  // Bootstrap tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (el) { return new bootstrap.Tooltip(el); });
});

function setupGrid(){
  const n = parseInt(document.getElementById('numQ').value);
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for(let i=0;i<n;i++){
    const row = document.createElement('div'); row.className='row';
    for(let c=0;c<12;c++){
      const cell=document.createElement('div'); cell.className='cell';
      cell.ondragover=ev=>{ev.preventDefault();cell.classList.add('drop-target');};
      cell.ondragleave=ev=>{cell.classList.remove('drop-target');};
      cell.ondrop=ev=>{ev.preventDefault();cell.classList.remove('drop-target'); placeGate(i,c);}
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
  gates=[]; 
  if(probChart !== null){ probChart.destroy(); probChart = null; }
}

function placeGate(qubit,time){
  gates.push({type:dragGate, qubits:[qubit], time:time});
  renderGrid();
}

function renderGrid(){
  const rows=document.querySelectorAll('.row');
  rows.forEach(r=>Array.from(r.children).forEach(c=>c.innerHTML=''));
  gates.forEach(g=>{
    const cell = rows[g.qubits[0]].children[g.time];
    const el=document.createElement('div'); el.className='g'; el.innerText=g.type;
    cell.appendChild(el);
  });
}

async function simulate(){
  const n=parseInt(document.getElementById('numQ').value);
  const resp=await fetch('/simulate',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({num_qubits:n,gates:gates})
  });
  const data=await resp.json(); 
  showProbs(data.probabilities);
}

function showProbs(probs){
    const ctx = document.getElementById('probChart').getContext('2d');
    const labels = probs.map((_, i) => `Qubit ${i+1}`);
    const data = {
        labels: labels,
        datasets: [{
            label: 'Probability of |1>',
            data: probs.map(p => (p*100).toFixed(1)),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: { beginAtZero: true, max: 100, title: { display: true, text: 'Probability (%)' } }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context){ return context.parsed.y + '%'; }
                    }
                }
            }
        }
    };

    if(probChart !== null){ probChart.destroy(); }
    probChart = new Chart(ctx, config);
}

