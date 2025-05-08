// 音乐播放器控制
const music = document.getElementById('bgMusic');
const volumeControl = document.getElementById('volume');

document.getElementById('musicBtn').addEventListener('click', function() {
    const btn = this;
    
    if (music.paused) {
        music.play();
        btn.innerHTML = '<i class="fas fa-music"></i> 暂停喵喵音乐';
        btn.style.backgroundColor = '#ff9eb1';
    } else {
        music.pause();
        btn.innerHTML = '<i class="fas fa-music"></i> 播放喵喵音乐';
        btn.style.backgroundColor = '';
    }
});

volumeControl.addEventListener('input', function() {
    music.volume = this.value;
});

// 心情记录功能
let selectedMood = '';
document.querySelectorAll('.emoji-selector span').forEach(emoji => {
    emoji.addEventListener('click', function() {
        selectedMood = this.getAttribute('data-mood');
        document.querySelectorAll('.emoji-selector span').forEach(e => {
            e.style.transform = '';
            e.style.textShadow = '';
        });
        this.style.transform = 'scale(1.4) rotate(-10deg)';
        this.style.textShadow = '0 0 15px var(--cat-pink)';
        
        // 添加猫咪反馈
        const moods = {
            '开心': '喵喵~ 今天也是开心的一天！',
            '平静': '呼噜呼噜...好舒服~',
            '调皮': '喵！想玩逗猫棒！',
            '生气': '喵嗷！不要惹我！',
            '困倦': 'Zzz...喵想睡觉...'
        };
        showCatMessage(moods[selectedMood]);
    });
});

function showCatMessage(msg) {
    const bubble = document.createElement('div');
    bubble.className = 'cat-bubble';
    bubble.textContent = msg;
    bubble.style.position = 'fixed';
    bubble.style.bottom = '20px';
    bubble.style.right = '20px';
    bubble.style.backgroundColor = 'white';
    bubble.style.padding = '10px 15px';
    bubble.style.borderRadius = '20px';
    bubble.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
    bubble.style.zIndex = '1000';
    bubble.style.animation = 'fadeIn 0.5s';
    
    document.body.appendChild(bubble);
    
    setTimeout(() => {
        bubble.style.animation = 'fadeOut 0.5s';
        setTimeout(() => bubble.remove(), 500);
    }, 2000);
}

document.getElementById('saveMood').addEventListener('click', function() {
    const note = document.getElementById('moodNote').value.trim();
    
    if (!selectedMood) {
        showCatMessage('喵！还没选心情呢！');
        return;
    }
    
    const today = new Date();
    const dateStr = `${today.getMonth()+1}月${today.getDate()}日`;
    const timeStr = today.toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'});
    
    const moodEntry = document.createElement('div');
    moodEntry.className = 'mood-entry';
    moodEntry.innerHTML = `
        <span class="mood-date">${dateStr} ${timeStr}</span>
        <span class="mood-emoji">${getMoodEmoji(selectedMood)}</span>
        <span class="mood-text">${selectedMood}${note ? ' - ' + note : ''}</span>
    `;
    
    document.getElementById('moodHistory').prepend(moodEntry);
    document.getElementById('moodNote').value = '';
    
    // 保存到本地存储
    saveToLocalStorage('moods', {
        date: dateStr + ' ' + timeStr,
        mood: selectedMood,
        note: note
    });
    
    showCatMessage('心情保存成功！喵~');
});

function getMoodEmoji(mood) {
    const emojiMap = {
        '开心': '😻',
        '平静': '😽',
        '调皮': '😹',
        '生气': '😾',
        '困倦': '🐱‍💤'
    };
    return emojiMap[mood] || '🐱';
}

// 体重记录功能
const weightChart = new Chart(
    document.getElementById('weightChart'),
    {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '体重记录 (kg)',
                data: [],
                borderColor: '#FFB6C1',
                backgroundColor: 'rgba(255, 182, 193, 0.2)',
                tension: 0.3,
                fill: true,
                borderWidth: 3,
                pointBackgroundColor: '#FFB6C1',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: 'Mali',
                            size: 14
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(139, 184, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(139, 184, 255, 0.1)'
                    }
                }
            }
        }
    }
);

document.getElementById('saveWeight').addEventListener('click', function() {
    const weightInput = document.getElementById('weightInput');
    const weight = parseFloat(weightInput.value);
    
    if (isNaN(weight) || weight <= 0) {
        showCatMessage('喵！请输入有效的体重！');
        weightInput.focus();
        return;
    }
    
    const today = new Date();
    const dateStr = `${today.getMonth()+1}/${today.getDate()}`;
    
    // 更新图表
    weightChart.data.labels.push(dateStr);
    weightChart.data.datasets[0].data.push(weight);
    weightChart.update();
    
    weightInput.value = '';
    
    // 保存到本地存储
    saveToLocalStorage('weights', {
        date: dateStr,
        weight: weight
    });
    
    showCatMessage(`记录成功！现在是${weight}kg喵~`);
});

// 打卡功能
document.getElementById('saveHabits').addEventListener('click', function() {
    const today = new Date().toLocaleDateString();
    const habits = [];
    
    document.querySelectorAll('.habit:checked').forEach(checkbox => {
        habits.push(checkbox.getAttribute('data-habit'));
    });
    
    if (habits.length === 0) {
        showCatMessage('喵！至少选一个打卡项嘛~');
        return;
    }
    
    // 保存到本地存储
    saveToLocalStorage('habits', {
        date: today,
        habits: habits
    });
    
    // 更新连续打卡天数
    updateStreakCounter();
    
    // 显示猫咪鼓励
    const encouragements = [
        '喵喵好棒！继续加油！',
        '今天也是努力的喵~',
        '坚持打卡有小鱼干奖励哦！',
        '喵呜~ 你做得真好！'
    ];
    showCatMessage(encouragements[Math.floor(Math.random() * encouragements.length)]);
    
    // 重置复选框
    document.querySelectorAll('.habit').forEach(cb => cb.checked = false);
});

// 本地存储辅助函数
function saveToLocalStorage(key, data) {
    let records = JSON.parse(localStorage.getItem(key) || '[]');
    records.push(data);
    localStorage.setItem(key, JSON.stringify(records));
}

function updateStreakCounter() {
    // 这里可以添加计算连续打卡天数的逻辑
    const streaks = {
        1: '第一天！喵喵起步~',
        3: '连续3天！保持哦！',
        7: '一周啦！奖励摸摸头~',
        14: '两周坚持！超棒喵！',
        30: '一个月！你是最棒的猫奴！'
    };
    
    const randomStreak = Math.floor(Math.random() * 30) + 1;
    let message = `已经连续打卡 ${randomStreak} 天！`;
    
    if (streaks[randomStreak]) {
        message += ' ' + streaks[randomStreak];
    }
    
    document.getElementById('streakCounter').innerHTML = `
        <div class="streak-message">${message}</div>
        <div class="streak-cat">${'🐱'.repeat(Math.min(5, Math.floor(randomStreak/5)))}</div>
    `;
}

// 页面加载时初始化数据
window.addEventListener('DOMContentLoaded', function() {
    // 加载历史心情记录
    const savedMoods = JSON.parse(localStorage.getItem('moods') || '[]');
    savedMoods.forEach(mood => {
        const moodEntry = document.createElement('div');
        moodEntry.className = 'mood-entry';
        moodEntry.innerHTML = `
            <span class="mood-date">${mood.date}</span>
            <span class="mood-emoji">${getMoodEmoji(mood.mood)}</span>
            <span class="mood-text">${mood.mood}${mood.note ? ' - ' + mood.note : ''}</span>
        `;
        document.getElementById('moodHistory').appendChild(moodEntry);
    });
    
    // 加载历史体重数据
    const savedWeights = JSON.parse(localStorage.getItem('weights') || '[]');
    savedWeights.forEach(record => {
        weightChart.data.labels.push(record.date);
        weightChart.data.datasets[0].data.push(record.weight);
    });
    weightChart.update();
    
    // 初始化打卡天数
    updateStreakCounter();
    
    // 添加猫咪欢迎语
    setTimeout(() => {
        showCatMessage('欢迎回来喵~ 今天也要开心哦！');
    }, 1000);
});

// CSS动画
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
}
.cat-bubble {
    animation: fadeIn 0.5s;
}
`;
document.head.appendChild(style);