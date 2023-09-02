const holder = document.body
var source = []
setUpUploadArea()

function filterConditionIsChanged() {
    const filtered = filterSource()
    drawTable(filtered)
}

function highlightIsChanged() {
    const target = document.getElementById('highlight').value
    if (target.length === 0) {
        filterConditionIsChanged();
        return
    }
    const table = document.getElementById('logTable')
    var innerHTML = table.innerHTML
    const resetRE = new RegExp(`<mark>(.*?)</mark>`, 'g');
    innerHTML = innerHTML.replace(resetRE, `$1`)
    const hightlightRE = new RegExp(`${target}`, 'g');
    innerHTML = innerHTML.replace(hightlightRE, `<mark>${target}</mark>`)
    table.innerHTML = innerHTML
}

function setUpUploadArea() {
    holder.addEventListener('drop', handleDropEvent)
    holder.ondragover = function () {
        this.className = 'hover';
        return false;
    };
    holder.ondragend = function () {
        this.className = '';
        return false;
    };
}

function handleDropEvent(e) {
    e.preventDefault();

    const file = e.dataTransfer.files[0]
    const reader = new FileReader();

    if (file.name.endsWith('log') == false && file.name.endsWith('txt') == false) {
        alert('The file should be .log or .txt')
        return
    }

    reader.onload = function (event) {
        parse(event.target.result);
    };
    reader.readAsText(file);

    return false;
}

function parse(log) {
    const lines = logPreProcess(log)
    source = lines.map(line => {
        const data = line.split(':')
        const dateComponent = data[0].split(' ')
        const date = dateComponent[0].trim()
        const time = `${dateComponent[1]}:${data[1]}:${data[2]}`.trim()
        const type = `${data[3]}`.trim()

        const index = line.indexOf(`${type}`, type.length)
        const offset = type.length + 3
        const logInfo = line.substring(index + offset).trim()
        
        return {
            'date': date,
            'time': time,
            'type': type,
            'logInfo': logInfo
        }
    })
    resetConsole();
    filterConditionIsChanged()
}

function logPreProcess(log) {
    const lines = log.split('\n');
    var processed = []
    for (var i = 0; i < lines.length; i++) {
        const line = lines[i]
        const date = line.slice(0, 10)
        if (date.split('-').length === 3) {
            processed.push(line)
        } else {
            processed[processed.length -1] += line
        }
    }
    return processed
}

function resetConsole() {
    document.getElementById('dateInput').value = ''
    document.getElementById('highlight').value = ''
    document.getElementById('typeSelect').value = 'all'
}

function filterSource() {
    const date = document.getElementById('dateInput').value
    const type = document.getElementById('typeSelect').value
    const filtered = source.filter(data => {
        const dateCondition = (date.length > 0) ? data['date'] === date : true
        const typeCondition = (type === 'all') ? true : data['type'].toLocaleLowerCase() === type
        return dateCondition && typeCondition
    })
    return filtered
}

function drawTable(data) {
    const cells = data.map(line => {
        return `
        <tr>
            <td>${line['date']}</td>
            <td>${line['time']}</td>
            <td>${line['type']}</td>
            <td>${line['logInfo']}</td>
        </tr>
        `
    })
    const head = `
    <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Type</th>
        <th>Log</th>
    </tr>
    `
    const table = document.getElementById('logTable')
    table.innerHTML = `${head} ${cells.join('')}`
}