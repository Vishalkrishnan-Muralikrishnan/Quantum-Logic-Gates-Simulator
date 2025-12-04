let gates = [];
let dragGate = null;

document.querySelectorAll('.gate-tile').forEach(tile => {
  tile.addEventListener('dragstart', ev => dragGate = ev.target.getAttribute('data-gate'));
});

function setupGrid(){
  const n = parseInt(document.getElementById('numQ').value);
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for(let i=0;i<n;i++){
    const row = document.createElement('div');
    row.className='row';
    for(let c=0;c<8;c++){
      const cell = document.createElement('div');
      cell.className='cell';
      cell.ondragover = ev=>ev.preventDefault();
      cell.ondrop = ev=>{
        ev.preventDefault();
        placeGate(i,c);
      };
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
  gates=[];
}

function placeGate(qubit,time){
  gates.push({type: dragGate, qubits:[qubit], time:time});
  renderGrid();
}

function renderGrid(){
  const rows = document.querySelectorAll('.row');
  gates.forEach(g=>{
    const cell = rows[g.qubits[0]].children[g.time];
    let el = cell.querySelector('.g');
    if(!el){
      el=document.createElement('div');
      el.className='g';
      cell.appendChild(el);
    }
    el.innerText=g.type;
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
  const out=document.getElementById('output');
  out.innerHTML='';
  probs.forEach((p,i)=>{
    const div=document.createElement('div');
    div.innerText=`Qubit ${i}: P(|1>)=${p.toFixed(2)}`;
    div.style.background=`rgba(0,255,0,${p})`;
    div.style.width='50px';
    div.style.height='20px';
    div.style.margin='2px auto';
    div.style.borderRadius='5px';
    out.appendChild(div);
  });
}
