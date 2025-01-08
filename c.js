// Khởi tạo các thành phần cơ bản để vẽ và thao tác trên đồ thị
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = document.getElementById('graph').clientWidth;
canvas.height = document.getElementById('graph').clientHeight;

let nodes = [];
let edges = [];
let currentMode = null;
let graphType = 'undirected';
let startNode = null;
let names = []; 
let selectedNodes = [];

const nodeR = 20;
const nodeColor = '#e3e3e3cb';
const edgeColor = '#FFD700';
const directedEdgeColor = '#fc5b85';

// Chế độ hiện tại của chương trình
function setMode(mode) {
    currentMode = mode;
}

// Kiểu đồ thị hiện tại
function setGraphType(type) {
    graphType = type;
}

//Xác định vị trí của lần nhấp chuột trên canvas và thực hiện hành động
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Kiểm tra chế độ hoạt động (currentMode)
    if (currentMode === 'addNode') {
        addNode(x, y);
    } else if (currentMode === 'addEdge') {
        addEdge(x, y);
    } else if (currentMode === 'remove') {
        removeElement(x, y);
    } else if (currentMode === 'selectstart') {
        selectstartNode(x, y);
    }
});

 //Hàm addNode cho phép thêm một đỉnh vào đồ thị tại tọa độ cụ thể
function addNode(x, y) {
    const nodeId = names.length > 0 
        ? names.shift() 
        : String.fromCharCode(65 + nodes.length); 

    nodes.push({ id: nodeId, x, y });
    drawGraph();
}

//Hàm addEdge có chức năng thêm cạnh vào đồ thị, bao gồm cả việc gán trọng số cho cạnh đó
function addEdge(x, y) {
    const clickedNode = nodes.find(node => {
        const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
        return dist <= nodeR;
    });

    if (clickedNode) {
        selectedNodes.push(clickedNode);

        if (selectedNodes.length === 2) {
            let weight = prompt("Nhập trọng số:");
            
            // Kiểm tra nếu trọng số nhập vào không hợp lệ
            if (!weight || isNaN(weight) || parseInt(weight) < 0) {
                alert("Chú ý, trọng số phải là 1 số tự nhiên!");
                selectedNodes = [];
                return; 
            }

            // Thêm cạnh vào danh sách các cạnh của đồ thị
            edges.push({
                from: selectedNodes[0].id,
                to: selectedNodes[1].id,
                weight: parseInt(weight) 
            });

            selectedNodes = [];
            drawGraph();
        }
    }
}

// Vẽ đồ thị 
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ các đỉnh
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#000'; 
        ctx.font = 'bold 16px Arial'; 
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle'; 
        ctx.fillText(node.id, node.x, node.y); 
    });

    // Vẽ các cạnh
    edges.forEach(edge => {
        const fromNode = nodes.find(node => node.id === edge.from);
        const toNode = nodes.find(node => node.id === edge.to);

        if (fromNode && toNode) {
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const fromX = fromNode.x + (nodeR * dx) / distance;
            const fromY = fromNode.y + (nodeR * dy) / distance;

            const toX = toNode.x - (nodeR * dx) / distance;
            const toY = toNode.y - (nodeR * dy) / distance;

            ctx.beginPath();
            ctx.moveTo(fromX, fromY);  
            ctx.lineTo(toX, toY);  
            ctx.strokeStyle = graphType === 'directed' ? directedEdgeColor : edgeColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Hiệnr thị trọng số
            const weightX = (fromNode.x + toNode.x) / 2 - 15;
            const weightY = (fromNode.y + toNode.y) / 2 - 20;

            if (graphType === 'directed') {
                ctx.fillStyle = '#fc5b85';  
            } else {
                ctx.fillStyle = '#FFD700'; 
            }

            ctx.fillText(edge.weight, weightX, weightY);

            // Vẽ mũi tên nếu đồ thị có hướng
            if (graphType === 'directed') {
                    mt(fromNode, toNode);
            }
        }
    });
}

// Hàm vẽ mũi tên cho đồ thị có hướng
function mt(fromNode, toNode) {
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const adjustedToX = toNode.x - (nodeR * dx) / distance;
    const adjustedToY = toNode.y - (nodeR * dy) / distance;

    const angle = Math.atan2(dy, dx);
    const arrowLength = 10; 
    const arrowAngle = Math.PI / 6; 

    const arrowX1 = adjustedToX - arrowLength * Math.cos(angle - arrowAngle);
    const arrowY1 = adjustedToY - arrowLength * Math.sin(angle - arrowAngle);
    const arrowX2 = adjustedToX - arrowLength * Math.cos(angle + arrowAngle);
    const arrowY2 = adjustedToY - arrowLength * Math.sin(angle + arrowAngle);
    
    // Vẽ mũi tên
    ctx.beginPath();
    ctx.moveTo(adjustedToX, adjustedToY);
    ctx.lineTo(arrowX1, arrowY1);
    ctx.lineTo(arrowX2, arrowY2);
    ctx.lineTo(adjustedToX, adjustedToY);
    ctx.fillStyle = directedEdgeColor;
    ctx.fill();
}

//Hàm removeElement thực hiện chức năng xóa đỉnh hoặc cạnh khỏi đồ thị
function removeElement(x, y) {
    //  Tìm đỉnh và xóa 
    const clickedNodeIndex = nodes.findIndex(node => {
        const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
        return dist <= nodeR;
    });

    if (clickedNodeIndex !== -1) {
        const nodeId = nodes[clickedNodeIndex].id;
        names.push(nodeId); // Thêm ID của đỉnh vào danh sách names để tái sử dụng
        nodes.splice(clickedNodeIndex, 1);
        edges = edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId);
        drawGraph();
        return;
    }

    // Xác định cạnh và xóa
    const clickedEdgeIndex = edges.findIndex(edge => {
        const fromNode = nodes.find(node => node.id === edge.from);
        const toNode = nodes.find(node => node.id === edge.to);
        if (fromNode && toNode) {
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2 - 30;
            const distanceToCurve = Math.abs(
                ((toNode.y - fromNode.y) * x - (toNode.x - fromNode.x) * y +
                    toNode.x * fromNode.y - toNode.y * fromNode.x) /
                Math.sqrt(
                    (toNode.y - fromNode.y) ** 2 + (toNode.x - fromNode.x) ** 2
                )
            );
            return distanceToCurve <= 10;
        }
        return false;
    });

    if (clickedEdgeIndex !== -1) {
        edges.splice(clickedEdgeIndex, 1);
        drawGraph();
    }
}

//Hàm selectStartNode dùng để chọn một đỉnh trong đồ thị làm điểm bắt đầu cho các thuật toán liên quan
function selectstartNode(x, y) {
    const clickedNode = nodes.find(node => {
        const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
        return dist <= nodeR;
    });

    if (clickedNode) {
        startNode = clickedNode.id;
        alert("Đã chọn đỉnh bắt đầu: " + startNode);
    }
}

// Xóa toàn bộ đồ thị, bao gồm các đỉnh, cạnh và dữ liệu liên quan
function deleteGraph() {
    nodes = [];
    edges = [];
    names = [];
    startNode = null;
    drawGraph();
    document.getElementById('output').innerHTML = "<h3>Kết quả thuật toán:</h3><p>Chưa có kết quả.</p>";
}

function createGraphMatrix() {
    const n = nodes.length;
    const matrix = Array.from({ length: n }, () => Array(n).fill(Infinity));

    edges.forEach(edge => {
        const fromIndex = nodes.findIndex(node => node.id === edge.from);
        const toIndex = nodes.findIndex(node => node.id === edge.to);

        matrix[fromIndex][toIndex] = edge.weight; // Đồ thị có hướng
        if (graphType === 'undirected') {
            matrix[toIndex][fromIndex] = edge.weight; // Nếu là đồ thị vô hướng, cập nhật cả hai chiều
        }
    });

    return matrix;
}

// Hàm thực hiện thuật toán Prim để tìm cây khung nhỏ nhất (MST) từ một đỉnh bắt đầu
function primAlgorithm(st, graph) {
    const n = graph.length; 
    const visited = new Array(n).fill(false);  // Mảng đánh dấu các đỉnh đã thăm
    const mstEdges = []; 

    visited[st] = true; 
    let nT = 0;  // Biến đếm số cạnh đã được thêm vào MST


    while (nT < n - 1) {
        let minEdge = null; 

        // Duyệt qua các đỉnh đã thăm để tìm cạnh nhỏ nhất nối với đỉnh chưa thăm
        for (let u = 0; u < n; u++) {
            if (visited[u]) {  
                for (let v = 0; v < n; v++) {
                    if (!visited[v] && graph[u][v] > 0) { 
                        // Nếu chưa có cạnh nào hoặc cạnh u-v có trọng số nhỏ hơn cạnh hiện tại
                        if (!minEdge || graph[u][v] < minEdge.weight) {
                            minEdge = { from: u, to: v, weight: graph[u][v] };
                        }
                    }
                }
            }
        }

        if (!minEdge) {
            break;  
        }
        
        mstEdges.push(minEdge);  // Thêm cạnh vào MST
        visited[minEdge.to] = true; 
        nT++;  
    }
    return mstEdges; 
}

// Hàm tìm các thành phần liên thông
function timTPLT(graph) {
    const n = graph.length;
    const visited = new Array(n).fill(0);  // Mảng đánh dấu các đỉnh đã thăm (0 = chưa thăm, số khác = mã thành phần liên thông)
    const cacTPLT = [];

    // Hàm DFS tìm kiếm theo chiều sâu
    function dfs(node, TPLT, IdTPLT) {
        const stack = [node];
        while (stack.length > 0) {
            const u = stack.pop();
            if (!visited[u]) { 
                visited[u] = IdTPLT;
                TPLT.push(u); 
                for (let v = 0; v < n; v++) {
                    // Nếu có cạnh nối u-v và v chưa thăm, thêm v vào stack
                    if (graph[u][v] !== Infinity && graph[u][v] !== 0 && !visited[v]) {
                        stack.push(v);
                    }
                }
            }
        }
    }

    let IdTPLT = 0;  // Đếm số thành phần liên thông
    for (let i = 0; i < n; i++) {
        if (!visited[i]) {  // Nếu đỉnh chưa thăm
            const TPLT = [];  // Mảng chứa đỉnh của thành phần liên thông
            dfs(i, TPLT, ++IdTPLT);
            cacTPLT.push(TPLT);
        }
    }

    return { cacTPLT,DemTPLT: IdTPLT }; 
}

// Hàm chạy thuật toán Prim và hiển thị kết quả
function runPrim() {
    if (!startNode) {  // Nếu chưa chọn đỉnh bắt đầu
        alert("Vui lòng chọn đỉnh bắt đầu.");
        return;
    }

    const graphMatrix = createGraphMatrix();
    const { cacTPLT,DemTPLT } = timTPLT(graphMatrix); 
    const output = document.getElementById('output');  // Lấy phần tử output trên giao diện
    output.innerHTML = "<h3>Kết quả thuật toán Prim:</h3>";
    let allMstEdges = [];  // Mảng chứa tất cả các cạnh của MST   

    if (DemTPLT > 1) {  // Nếu đồ thị không liên thông
        output.innerHTML += `<p><strong>Đồ thị không liên thông. Có ${DemTPLT} thành phần liên thông:</strong></p>`;
        cacTPLT.forEach((TPLT, index) => {
            const nodeIds = TPLT.map(node => nodes[node].id).join(', ');
            output.innerHTML += `<p><strong>Thành phần ${index + 1}: ${nodeIds}</p><strong>`;

            const subGraph = TPLT.map(row => TPLT.map(col => graphMatrix[row][col]));  // Tạo con đồ thị con
            const subNodes = TPLT.map(index => nodes[index]);  // Lấy các đỉnh con
            const dinhBdcuaTPLT = subNodes.findIndex(node => node.id === startNode);  // Tìm đỉnh bắt đầu trong con đồ thị

            const startIndex = dinhBdcuaTPLT === -1 ? 0 : dinhBdcuaTPLT;  // Nếu không tìm thấy, lấy đỉnh đầu tiên

            if (TPLT.length === 1) {  // Nếu thành phần chỉ có 1 đỉnh
                output.innerHTML += `<p>Không có cạnh trong thành phần ${index + 1} vì chỉ có 1 đỉnh.</p>`;
            } else {
                const mstEdges = primAlgorithm(startIndex, subGraph, subNodes);  // Chạy thuật toán Prim trên con đồ thị

                const totalWeight = mstEdges.reduce((sum, edge) => sum + edge.weight, 0);
                allMstEdges.push(mstEdges); 

                output.innerHTML += `<p>Kết quả MST cho thành phần ${index + 1}:</p>`;
                mstEdges.forEach(edge => {  // Hiển thị các cạnh trong MST
                    output.innerHTML += `<p>${subNodes[edge.from].id} - ${subNodes[edge.to].id}: ${edge.weight}</p>`;
                });
                output.innerHTML += `<p>Tổng trọng số: ${totalWeight}</p>`;
            }
        });
    } else {  // Nếu đồ thị là liên thông
        output.innerHTML += `<p><strong>Đồ thị liên thông.</strong></p>`;
        const startIndex = nodes.findIndex(node => node.id === startNode);  // Tìm đỉnh bắt đầu trong đồ thị
        const mstEdges = primAlgorithm(startIndex, graphMatrix, nodes);  // Chạy thuật toán Prim trên đồ thị

        const totalWeight = mstEdges.reduce((sum, edge) => sum + edge.weight, 0); 
        allMstEdges = mstEdges;

        mstEdges.forEach(edge => { 
            output.innerHTML += `<p>${nodes[edge.from].id} - ${nodes[edge.to].id}: ${edge.weight}</p>`;
        });
        output.innerHTML += `<h4>Tổng trọng số: ${totalWeight}</h4>`;
    }
}

// Hàm thực hiện thuật toán Dijkstra để tìm đường đi ngắn nhất từ một đỉnh bắt đầu đến tất cả các đỉnh khác
function dijkstraAlgorithm(graphMatrix, startIndex) {
    const n = graphMatrix.length;
    const dist = new Array(n).fill(Infinity); // Khoảng cách ngắn nhất từ đỉnh bắt đầu đến các đỉnh khác (khởi tạo tất cả là vô cực)
    const prev = new Array(n).fill(null); // Lưu đỉnh trước đó trên đường đi ngắn nhất từ đỉnh bắt đầu đến một đỉnh (khởi tạo tất cả là null)
    const visited = new Array(n).fill(false); // Đánh dấu các đỉnh đã thăm

    dist[startIndex] = 0; // Khoảng cách từ đỉnh bắt đầu đến chính nó là 0

    for (let i = 0; i < n; i++) {
        let u = -1;
        for (let v = 0; v < n; v++) {
            if (!visited[v] && (u === -1 || dist[v] < dist[u])) {
                u = v;
            }
        }

        if (dist[u] === Infinity) break; // Nếu không còn đỉnh nào có thể thăm được thì thoát vòng lặp
        visited[u] = true;

        // Cập nhật khoảng cách và đường đi cho các đỉnh kề với đỉnh u
        for (let v = 0; v < n; v++) {
            if (graphMatrix[u][v] !== Infinity && !visited[v]) {
                const newDist = dist[u] + graphMatrix[u][v];
                if (newDist < dist[v]) {
                    dist[v] = newDist;
                    prev[v] = u;
                }
            }
        }
    }

    return { dist, prev }; // Trả về khoảng cách và mảng đường đi
}

// Hàm chạy thuật toán Dijkstra và hiển thị kết quả
function runDijkstra() {
    if (!startNode) {
        alert("Vui lòng chọn đỉnh bắt đầu.");
        return;
    }

    const graphMatrix = createGraphMatrix();
    const startIndex = nodes.findIndex(node => node.id === startNode);

    const { dist, prev } = dijkstraAlgorithm(graphMatrix, startIndex);

    const output = document.getElementById('output');
    output.innerHTML = "<h3>Kết quả thuật toán Dijkstra:</h3>";
    nodes.forEach((node, index) => {
        if (dist[index] !== Infinity) {
            let path = [];
            for (let at = index; at !== null; at = prev[at]) {
                path.push(nodes[at].id);
            }
            path.reverse();
            output.innerHTML += `<p>${startNode} -> ${node.id}: ${dist[index]} (Đường đi: ${path.join(' -> ')})</p>`;
        } else {
            output.innerHTML += `<p>${startNode} -> ${node.id}: Không có đường đi</p>`;
        }
    });
}
