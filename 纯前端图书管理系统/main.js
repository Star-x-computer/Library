let bookList = [];
let currentView = "all";
let searchWord = "";

window.onload = function () {
    const local = localStorage.getItem("bookData");
    if (local) {
        bookList = JSON.parse(local);
    } else {
        bookList = [
            {
                id: 1, name: "活着", author: "余华", position: "一楼文学A01",
                borrowUser: "", borrowDate: "", returnDate: "", status: "在馆"
            },
            {
                id: 2, name: "Python编程", author: "张三", position: "二楼科技B02",
                borrowUser: "李明", borrowDate: "2026-06-01", returnDate: "2026-06-21", status: "逾期未还"
            },
            {
                id: 3, name: "中国古代史", author: "李四", position: "三楼历史C05",
                borrowUser: "王浩", borrowDate: "2026-06-10", returnDate: "2026-06-23", status: "已借出"
            }
        ];
        saveStorage();
    }
    bindEvent();
    renderData();
}

function saveStorage() {
    localStorage.setItem("bookData", JSON.stringify(bookList));
}
function bindEvent() {
    document.querySelectorAll(".view-btn").forEach(btn => {
        btn.onclick = function () {
            document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            currentView = this.dataset.view;
            renderData();
        }
    })
    document.getElementById("openAdd").onclick = openAddDialog;
    document.getElementById("closeMask").onclick = closeMask;
    document.getElementById("resetForm").onclick = resetDialogForm;
    document.getElementById("saveBook").onclick = saveBookInfo;
    document.getElementById("searchBtn").onclick = function () {
        searchWord = document.getElementById("searchInput").value.trim();
        renderData();
    }
}

function getFilterData() {
    let arr = bookList.filter(item => {
        const matchSearch = item.name.includes(searchWord);
        if (!matchSearch) return false;
        if (currentView === "all") return true;
        if (currentView === "borrow") return item.status === "已借出" || item.status === "逾期未还";
        if (currentView === "today") {
            const today = new Date().toISOString().split("T")[0];
            return item.returnDate === today;
        }
        return true;
    })
    return arr;
}

function getDayDiff(start, end) {
    if (!start || !end) return "-";
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff;
}

function renderData() {
    const table = document.getElementById("bookTable");
    const data = getFilterData();
    table.innerHTML = "";

    if (data.length === 0) {
        table.innerHTML = `<tr><td colspan="10" class="empty-tip">暂无匹配图书数据</td></tr>`;
    } else {
        data.forEach(book => {
            const day = getDayDiff(book.borrowDate, book.returnDate);
            let statusClass = "";
            if (book.status === "在馆") statusClass = "status-in";
            if (book.status === "已借出") statusClass = "status-borrow";
            if (book.status === "逾期未还") statusClass = "status-over";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${book.id}</td>
                <td>${book.name}</td>
                <td>${book.author}</td>
                <td>${book.position}</td>
                <td>${book.borrowUser || "-"}</td>
                <td>${book.borrowDate || "-"}</td>
                <td>${book.returnDate || "-"}</td>
                <td>${day}</td>
                <td class="${statusClass}">${book.status}</td>
                <td>
                    <button class="btn-edit" onclick="openEdit(${book.id})">编辑</button>
                    <button class="btn-del" onclick="delBook(${book.id})">删除</button>
                </td>
            `;
            table.appendChild(tr);
        })
    }
    renderStat();
}

function renderStat() {
    let total = bookList.length;
    let store = 0, borrow = 0, over = 0;
    bookList.forEach(item => {
        if (item.status === "在馆") store++;
        if (item.status === "已借出") borrow++;
        if (item.status === "逾期未还") over++;
    })
    document.getElementById("totalAll").innerText = total;
    document.getElementById("storeNum").innerText = store;
    document.getElementById("borrowNum").innerText = borrow;
    document.getElementById("overNum").innerText = over;
}

function openAddDialog() {
    document.getElementById("mask").style.display = "flex";
    document.getElementById("dialogTitle").innerText = "新增图书";
    resetDialogForm();
    document.getElementById("editId").value = "";
}

function closeMask() {
    document.getElementById("mask").style.display = "none";
}

function resetDialogForm() {
    document.getElementById("bookName").value = "";
    document.getElementById("author").value = "";
    document.getElementById("position").value = "";
    document.getElementById("borrowUser").value = "";
    document.getElementById("bookStatus").value = "在馆";
    document.getElementById("borrowDate").value = "";
    document.getElementById("returnDate").value = "";
}


function saveBookInfo() {
    const id = document.getElementById("editId").value;
    const name = document.getElementById("bookName").value.trim();
    const author = document.getElementById("author").value.trim();
    const pos = document.getElementById("position").value.trim();
    const user = document.getElementById("borrowUser").value.trim();
    const status = document.getElementById("bookStatus").value;
    const bDate = document.getElementById("borrowDate").value;
    const rDate = document.getElementById("returnDate").value;

    if (!name || !author || !pos) {
        alert("书名、作者、存放位置不能为空！");
        return;
    }
    if ((status === "已借出" || status === "逾期未还") && (!user || !bDate || !rDate)) {
        alert("已借出/逾期图书必须填写借阅人、借阅日期、归还日期！");
        return;
    }

    if (id) {

        const idx = bookList.findIndex(i => i.id == id);
        bookList[idx] = {
            id: Number(id), name, author, position: pos,
            borrowUser: user, borrowDate: bDate, returnDate: rDate, status
        }
    } else {        // 新增，自动生成ID
        const maxId = bookList.length ? Math.max(...bookList.map(i => i.id)) : 0;
        bookList.push({
            id: maxId + 1, name, author, position: pos,
            borrowUser: user, borrowDate: bDate, returnDate: rDate, status
        })
    }
    saveStorage();
    closeMask();
    renderData();
    alert("操作成功！");
}


window.openEdit = function (bid) {
    const book = bookList.find(item => item.id === bid);
    document.getElementById("mask").style.display = "flex";
    document.getElementById("dialogTitle").innerText = "编辑图书";
    document.getElementById("editId").value = bid;
    document.getElementById("bookName").value = book.name;
    document.getElementById("author").value = book.author;
    document.getElementById("position").value = book.position;
    document.getElementById("borrowUser").value = book.borrowUser;
    document.getElementById("bookStatus").value = book.status;
    document.getElementById("borrowDate").value = book.borrowDate;
    document.getElementById("returnDate").value = book.returnDate;
}


window.delBook = function (bid) {
    if (!confirm("确认删除该图书？删除数据无法恢复！")) return;
    bookList = bookList.filter(item => item.id !== bid);
    saveStorage();
    renderData();
    alert("删除完成");
}