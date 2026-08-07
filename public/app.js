(() => {
  const arena = document.getElementById('arena');
  const startButton = document.getElementById('start-game');
  const restartButton = document.getElementById('restart-game');
  const message = document.getElementById('game-message');
  const scoreEl = document.getElementById('score');
  const streakEl = document.getElementById('streak');
  const specificityEl = document.getElementById('specificity');
  const timeEl = document.getElementById('time');
  const bestEl = document.getElementById('high-score');

  if (!arena || !startButton) return;

  const game = {
    running: false,
    score: 0,
    streak: 0,
    hits: 0,
    wrong: 0,
    timeLeft: 30,
    spawnTimer: null,
    clockTimer: null,
    startedAt: 0,
    cells: new Set(),
  };

  const best = Number(localStorage.getItem('selectivityBest') || 0);
  bestEl.textContent = best ? `BEST ${best}` : 'BEST —';

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rand = (min, max) => Math.random() * (max - min) + min;

  function updateHud() {
    const attempts = game.hits + game.wrong;
    const specificity = attempts ? Math.round((game.hits / attempts) * 100) : 100;
    const multiplier = 1 + Math.floor(game.streak / 4);
    scoreEl.textContent = game.score;
    streakEl.textContent = `×${multiplier}`;
    specificityEl.textContent = `${specificity}%`;
    timeEl.textContent = game.timeLeft.toFixed(1);
  }

  function clearCells() {
    game.cells.forEach((cell) => cell.remove());
    game.cells.clear();
    arena.querySelectorAll('.float-score').forEach((el) => el.remove());
  }

  function showFloat(x, y, text, good) {
    const el = document.createElement('div');
    el.className = `float-score ${good ? 'good' : 'bad'}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.textContent = text;
    arena.appendChild(el);
    setTimeout(() => el.remove(), 600);
  }

  function removeCell(cell, hit = false) {
    if (!game.cells.has(cell)) return;
    game.cells.delete(cell);
    if (hit) {
      cell.classList.add('hit');
      setTimeout(() => cell.remove(), 120);
    } else {
      cell.remove();
    }
  }

  function spawnCell() {
    if (!game.running) return;

    const elapsed = 30 - game.timeLeft;
    const targetChance = clamp(.46 - elapsed * .004, .32, .46);
    const isTarget = Math.random() < targetChance;

    let hasU = Math.random() < .58;
    let hasG = Math.random() < .58;
    if (isTarget) {
      hasU = true;
      hasG = true;
    } else if (hasU && hasG) {
      Math.random() < .5 ? (hasU = false) : (hasG = false);
    }

    const rect = arena.getBoundingClientRect();
    const size = rand(58, 84);
    const margin = size * .7;
    const x = rand(margin, Math.max(margin + 1, rect.width - margin));
    const y = rand(margin, Math.max(margin + 1, rect.height - margin));

    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = `cell${isTarget ? ' target' : ''}`;
    cell.style.setProperty('--size', `${size}px`);
    cell.style.left = `${x}px`;
    cell.style.top = `${y}px`;
    cell.style.animationDuration = `${rand(1.1, 2.2)}s`;
    cell.dataset.target = String(isTarget);
    cell.setAttribute('aria-label', isTarget ? 'Cell with both target markers' : 'Decoy cell');

    cell.innerHTML = `
      <span class="cell-markers" aria-hidden="true">
        <span class="cell-badge ${hasU ? 'on u' : ''}">U</span>
        <span class="cell-badge ${hasG ? 'on g' : ''}">G</span>
      </span>
      <span class="cell-age" aria-hidden="true">${isTarget ? 'TARGET?' : 'DECOY?'}</span>
    `;

    const lifetime = clamp(1450 - elapsed * 17 + rand(-180, 180), 760, 1550);
    const timeout = setTimeout(() => removeCell(cell), lifetime);

    cell.addEventListener('click', () => {
      if (!game.running || !game.cells.has(cell)) return;
      clearTimeout(timeout);

      if (cell.dataset.target === 'true') {
        game.streak += 1;
        game.hits += 1;
        const multiplier = 1 + Math.floor(game.streak / 4);
        const points = multiplier * 10;
        game.score += points;
        showFloat(x, y, `+${points}`, true);
        removeCell(cell, true);
      } else {
        game.wrong += 1;
        game.streak = 0;
        game.score = Math.max(0, game.score - 15);
        cell.classList.add('miss');
        showFloat(x, y, 'OFF-TARGET −15', false);
        setTimeout(() => removeCell(cell), 170);
      }
      updateHud();
    });

    game.cells.add(cell);
    arena.appendChild(cell);
  }

  function scheduleSpawn() {
    if (!game.running) return;
    spawnCell();
    const elapsed = 30 - game.timeLeft;
    const delay = clamp(520 - elapsed * 8, 270, 520) + rand(-70, 70);
    game.spawnTimer = setTimeout(scheduleSpawn, delay);
  }

  function finishGame() {
    if (!game.running) return;
    game.running = false;
    clearTimeout(game.spawnTimer);
    clearInterval(game.clockTimer);
    clearCells();
    restartButton.disabled = false;
    startButton.textContent = 'PLAY AGAIN ↗';

    const attempts = game.hits + game.wrong;
    const specificity = attempts ? Math.round((game.hits / attempts) * 100) : 100;
    const oldBest = Number(localStorage.getItem('selectivityBest') || 0);
    if (game.score > oldBest) {
      localStorage.setItem('selectivityBest', String(game.score));
      bestEl.textContent = `BEST ${game.score}`;
    }

    message.classList.remove('hidden');
    message.innerHTML = `<span>${game.score}</span><p>${specificity}% specificity · ${game.hits} targets · ${game.wrong} off-target</p>`;
  }

  function startGame() {
    clearTimeout(game.spawnTimer);
    clearInterval(game.clockTimer);
    clearCells();

    game.running = true;
    game.score = 0;
    game.streak = 0;
    game.hits = 0;
    game.wrong = 0;
    game.timeLeft = 30;
    game.startedAt = performance.now();
    restartButton.disabled = true;
    message.classList.add('hidden');
    updateHud();

    scheduleSpawn();
    game.clockTimer = setInterval(() => {
      const elapsedSeconds = (performance.now() - game.startedAt) / 1000;
      game.timeLeft = Math.max(0, 30 - elapsedSeconds);
      updateHud();
      if (game.timeLeft <= 0) finishGame();
    }, 50);
  }

  startButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', startGame);
})();