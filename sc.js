 'use strict';

let util = {
	randomInteger: function(min, max){
		return Math.floor(min + Math.random() * (max + 1 - min));
	}
}

Function.prototype.method = function(name, func){
	if (!this.prototype[name]){
		this.prototype[name] = func;
		return this;
	}
}

Array.method("fillIncr", function(length, start) {
	 start = start || 0;
	for (let i = 0; i < length; i++) {
		this.push(i + start);
		}
	return this;
})	
Array.method("popRandom", function() {
	return this.splice(Math.floor(Math.random()*this.length),1)[0];
})
Array.method("shuffle", function() {
	for (let i = 0; i < this.length; i++) {
		let index = Math.floor(Math.random() * (i + 1))
		let saved = this[index]
		this[index] = this[i]
		this[i] = saved
	}


	return this
})	
//метод находит член массива со значением find, меняет его на replace
Array.method("findAndReplace", function(find,replace) {
	let index =this.indexOf(find)
	if (index> -1) {
		this[index] = replace
	}
})	
// прроверяет все члены массива на соответствие value. Если все равны вернет true
Array.method("allMembers", function(value) {
	for (let i = 0; i < this.length; i++) {
		if (this[i] !== value){
			return false
		}
	}
	return true
})	

Element.method("addClass", function(className) {
	let classes = this.className.split(" ");
	if (classes.indexOf(className) < 0) {
		classes.push(className);
		this.className = classes.join(" ").trim();
	}
	return this
})
Element.method("removeClass", function(className) {
	let classes = this.className.split(" ");
	let index = classes.indexOf(className);
	if (index >= 0) {
		classes.splice(index, 1);
		this.className = classes.join(" ").trim();
	}
	return this
})


let app = {};
app.Sudoku = function(are) {
	
	let table = document.createElement("table");
	table.addClass("sudoku");
	let area = are || 3;
	let expo = area * area;
	for (let i = 0; i < expo; i++) {
		let row = table.insertRow(-1);
	for (let j = 0; j < expo; j++) {
			let cell = row.insertCell(-1);
			cell.innerHTML = i + ";" + j;
			switch (i%area){
				case 0:
					cell.addClass("top");
				break;
				case area-1:
					cell.addClass("bottom");
				break;

			}
			switch (j%area){
				case 0:
					cell.addClass("left");
				break;
				case area-1:
					cell.addClass("right");
				break;

			}
		}
	}
	this.table = table;
	this.expo = expo;
}

app.Sudoku.prototype = {
	fill: function(values){
		let that = this;
		for (let i = 0; i < that.expo; i++) {
			let row = that.table.rows[i];
			for (let j = 0; j < that.expo; j++) {
				let cell = that.table.rows[i].cells[j];
				cell.innerHTML = values[i][j];
			}
		}
	},
	hide: function(count){
		let that = this;
		for (let i = 0; i < count; i++) {
			let proccessing = true;
			while (proccessing){
				let rowNumber = util.randomInteger(0, that.expo -1)
				let colNumber = util.randomInteger(0, that.expo -1)
				if (!that.table.rows[rowNumber].cells[colNumber].hided) {
					that.table.rows[rowNumber].cells[colNumber].hided = true
					that.table.rows[rowNumber].cells[colNumber].innerHTML = ""
					let editCell = document.createElement("input")
					that.table.rows[rowNumber].cells[colNumber].appendChild(editCell)
					that.table.rows[rowNumber].cells[colNumber].editCell = editCell
					editCell.addEventListener("change", function() {
						that.check()
					})
					proccessing = false
				}
			}
		}
		that.check()
	},
	//проверяет состояние игры
	check: function() {
		let that = this;
		that.unmark();
		//создаеми заполняем массивы. По ним отслеживаем, чтобы значения не повторялись
		let rows = [], columns = [], areas = []
		for (let i = 0; i < that.expo; i++) {
			rows.push([].fillIncr(that.expo, 1));
			columns.push([].fillIncr(that.expo, 1));
			areas.push([].fillIncr(that.expo, 1));
		}
		//проверяем значения
		Array.prototype.forEach.call(that.table.rows, function(row,i) {
			Array.prototype.forEach.call(row.cells, function(cell,j) {
				let value = that.getValue(cell);
				rows[i].findAndReplace(value, 0);
				columns[j].findAndReplace(value, 0);
				areas[that.getArea(i,j)].findAndReplace(value, 0);
			})
		})

		let correct = {
			rows: 0,
			columns: 0,
			areas: 0
		}
		for (let i = 0; i < that.expo; i++) {
			if (rows[i].allMembers(0)) {
				that.markRow(i)
				correct.rows++
			}
			if (columns[i].allMembers(0)) {
				that.markColum(i)
				correct.colums++
			}
			if (areas[i].allMembers(0)) {
				that.markArea(i)
				correct.areas++
			}
		}
		if (correct.rows === that.expo &&
			correct.colums === that.expo &&
			correct.areas === that.expo ) {	
			if (typeof(that.win) === "function") {
				that.win()
			}
		}
	},
	//отмечает ячейку cell классом, либо снимает класс, в зависимости от state
	markCell: function(cell, state) {
		if (state) {
			cell.addClass("marked")
		} else {
			cell.removeClass("marked")
		}
	},
	//возвращает значение ячейки, для поля, либо простой ячейки
	getValue:  function(cell) {
		if (cell.editCell) {
			return parseInt(cell.editCell.value,10)
		} else {
			return parseInt(cell.innerHTML, 10)
		}
	},
	//отмечает строку целиком
	markRow: function(number) {
		let that = this;
		Array.prototype.forEach.call(that.table.rows[number].cells, function(cell){
			that.markCell(cell, true)
		})
	},
	//отмечает колонку целиком
	markColum: function(number) {
		let that = this;
		Array.prototype.forEach.call(that.table.rows, function(row){
			that.markCell(row.cells[number], true)
		})
	},
	//отмечает область целиком
	markArea: function(number){
		let that = this;
		let area = Math.sqrt(that.expo)
		let startRow = parseInt(number/area, 10)*area
		let startColumn = (number%area)*area;
		for (let i = 0; i < area; i++) {
			for (let j = 0; j < area; j++) {
				that.markCell(that.table.rows[i+startRow].cells[j+startColumn],true)
			}
		}
	},
	//нимает отметки со всего игрового поля
	unmark: function() {
		let that = this;
		Array.prototype.forEach.call(that.table.rows, function(row,i) {
			Array.prototype.forEach.call(row.cells,function(cell, j){
				that.markCell(cell, false);
			})
		})
	},
	getArea: function(row, column) {
		let that = this;
		let area = Math.sqrt(that.expo);
		return parseInt(row/area)*area + parseInt(column/area)
	}

}

app.Generator = function(area){
	let that = this;
	area = area || 3;
	let expo = area * area;
	let base = [].fillIncr(expo, 1);
	//console.log(base)
	let rows =[]
	for (let i = 0; i < expo; i++) {
		let row = [];
		let start = (i%area)*area + parseInt(i/area, 10)
		//console.log(start)
		for (let j = 0; j < expo; j++) {
			row.push(base.slice(start, expo).concat(base)[j])
			//console.log(j ,' - ', base.slice(start, expo).concat(base)[j])

		}
		rows.push(row)
	}
	that.rows = rows;
	that.expo = expo;
	that.area = area;
}

app.Generator.prototype = {
	invertVertical: function() {
		let that = this; 
		that.rows.reverse();
		return that;
	},

	invertHorizontal: function() {
		let that = this; 
		console.log(that)
		for (let j = 0; j < that.expo; j++) {
			that.rows[j].reverse();
		}
		return that;
	},
	//возвращает два случайных числа из диапазона длины области
	getPositions: function() {
		let source = [].fillIncr(this.area);
		let positions = {
			startPos: source.popRandom(),
			destPos: source.popRandom()
		}
		return positions;
	},
	//перемешивать строки
	swapRows: function(count) {
		var that = this; 
		for (let i = 0; i < count; i++) {
			let area =util.randomInteger(0, that.area-1);
			let values = that.getPositions();
			let sourcePosition = area * that.area + values.startPos;
			let destPosition = area* that.area + values.destPos;
			let row = that.rows.splice(sourcePosition,1)[0];
			that.rows.splice(destPosition,0,row);
		}
		
		return that;
	},
	//перемешивать колонки
	swapColumns: function(count) {
		var that = this; 
		
		for (let i = 0; i < count; i++) {
			let area =util.randomInteger(0, that.area-1);
			let values = that.getPositions();
			let sourcePosition = area * that.area + values.startPos;
			let destPosition = area* that.area + values.destPos;
			for (let j = 0; j < that.expo; j++) {
				let cell = that.rows[j].splice(sourcePosition,1)[0];
				that.rows[j].splice(destPosition,0,cell);
			}
			
		}
		
		return that;
	},
	swapRowsRange: function(count) {
		let that = this; 
		console.log(that)
		for (let i = 0; i < count; i++) {
			let values = that.getPositions();
			let rows = that.rows.splice(values.startPos * that.area, that.area);
			let args = [values.destPos*that.area, 0].concat(rows);
			that.rows.splice.apply(that.rows, args);
			
		}
		
		return that;
	},
	swapColumnsRange: function(count) {
		let that = this; 
		for (let i = 0; i < count; i++) {
			let values = that.getPositions();
			for (let j = 0; j < that.expo; j++) {
				let cells = that.rows[j].splice(values.startPos * that.area, that.area);
				let args = [values.destPos*that.area, 0].concat(cells);
				that.rows[j].splice.apply(that.rows[j], args);
			}
		}
		
		return that;
	},
	//заменить все цифры в таблице значений
	shakeAll: function() {
		let that = this;
		let shaked = [].fillIncr(this.expo, 1);
		console.log(shaked)
		shaked.shuffle();
		console.log(shaked)
		for (let i = 0; i < that.expo; i++) {
			for (let j = 0; j < that.expo; j++) {
				that.rows[i][j] = shaked[that.rows[i][j]-1]
			}
		}
		return that;
	}
}

//создаем конструктор для типа Timer, который будет отвечать за учет времени и очков
app.Timer = function(){
	let that = this
	let content = document.createElement('div').addClass("timer");
	let display = document.createElement('div').addClass("display");
	content.appendChild(display)
	that.now = 0;
	that.timer = setInterval(function(){
		that.now++
		that.refresh()

	}, 1000)
	that.content = content
	that.display = display
	that.refresh() 
}

app.Timer.prototype = {
	//метод для обновления состояния времени
	refresh: function(){
		let that = this
		that.display.innerHTML = "Прошло времени: "+ that.now + "сек."
	},
	getScore: function(){
		return Math.pow(app.parameters.hided * app.parameters.area, 2) * 1000 / this.now

	},
	stop: function(){
		clearInterval(this.timer)
	}
}

app.parameters = {
	area: 3,  //размер области
	shuffle: 15,//колличествоперемешиваний
	hided: 45 // колличество скрытых ячеек
}



let tbl = new app.Sudoku(app.parameters.area);
document.body.querySelector("#playGround").appendChild(tbl.table);
let generator = new app.Generator(app.parameters.area);
generator.swapRows(15)
.swapColumns(15)
.swapRowsRange(15)
	.swapColumnsRange(5)
	.shakeAll()
;
util.randomInteger(0,1) ? generator.invertVertical() : 0;
util.randomInteger(0,1) ? generator.invertHorizontal() : 0;

tbl.fill(generator.rows);
tbl.hide(15)

let timer = new app.Timer()
document.body.querySelector("#playGround").appendChild(timer.content)

tbl.win = function() {
	alert("Поздраляем! Вы победили со счетом " + timer.getScore())
	timer.stop();
}