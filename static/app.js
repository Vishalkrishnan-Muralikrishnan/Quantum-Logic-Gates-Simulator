let gates = [];
let dragGate = null;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.gate-tile').forEach(t => {
    t.addEventListener('dragstart', ev => {
      dragGate = ev.target.dataset.gate;
      ev.dataTransfer.setData('text/plain', '');
    });
  });

  // Initialize Bootstrap tooltips
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
  gates=[]; document.getElementById('output').innerHTML='';
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
  const out=document.getElementById('output'); out.innerHTML='';
  probs.forEach((p,i)=>{
    const div=document.createElement('div'); 
    div.innerText=`Qubit ${i}: ${(p*100).toFixed(1)}%`;
    out.appendChild(div);
    setTimeout(()=>{div.style.width=`${p*100}%`;},50);
  });
}

