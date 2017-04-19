function Misual(canvas,config){
    var min = config.min;
    var max = config.max;
    var defaultMovingAveragePeriod = 100;
    
    var showLabels = config.showLabels;
    var showLineOfBestFit = config.showLineOfBestFit;
    var showMovingAverage = config.showMovingAverage;
    var movingAveragePeriod = defaultMovingAveragePeriod;
    
    var height = canvas.clientHeight;
    var width = canvas.clientWidth;
    var labelColor = "grey";
    var backgroundColor = "#4F4E4C";
    var lineOfBestFit = {
         m:0
        ,b:0
        ,at:function(x){
            return x*this.m + this.b;
        }
    }
    
    canvas.setAttribute("width",width);
    canvas.setAttribute("height",height);
    var ctx = canvas.getContext("2d");
    
    var barWidth = width/((max - min)*1.5);
    
    var bars = [];
    
    function invalidate(){
        
        // [ Clear screen ]
        ctx.fillStyle=backgroundColor;
        ctx.fillRect(0,0,width,height);
        ctx.fillStyle="black";
        
        if(showLabels){
            drawHorizontalLines();        
        }
        
        drawBars();
        
        if(showLabels){
            drawHorizontalLabels();
        }
        
        if(showLineOfBestFit){
            drawLineOfBestFit();
        }
        
        if(showMovingAverage){
            drawMovingAverage();
        }
        
    }
    
    function recalculate(){
        bars = [];
        for(var x = min; x < max; x++){
            var y = calculateValueForX(x);
            bars.push(y);
        }
        
        calculateLineOfBestFit();
        calculateSimpleMovingAverage();
    }
    
    function calculateValueForX(x){
        var y = config.fn(x);
        if(typeof y == "undefined" || isNaN(y)){
            y = 0;
        }
        return y;
    }
    
    function calculateLineOfBestFit(){
        // [ Uses the least squares method ]
        // https://www.varsitytutors.com/hotmath/hotmath_help/topics/line-of-best-fit
        var xMean = 0;
        var yMean = 0;
        
        // [ Calculate x mean ]
        for(var i = min; i <= max; i++){
            xMean += i;
        }
        xMean = xMean / (max - min + 1);
        
        // [ Calculate y mean ]
        for(var i = 0; i < bars.length; i++){
            yMean += bars[i];
        }
        yMean = yMean / bars.length;
        
        // [ Calculate rise and run ]
        var rise = 0;
        var run = 0;
        var xi = min;
        for(var i = 0; i < bars.length; i++){
            var yi = bars[i];
            
            rise += (xi - xMean)*(yi - yMean);
            run += (xi - xMean) * (xi - xMean);
            
            xi++;
        }
        
        var m = rise/run;
        var b = yMean - m*xMean;
        
        lineOfBestFit.m = m;
        lineOfBestFit.b = b;
    }
    
    var points = [];
    function calculateSimpleMovingAverage(){
        points = [];
        
        var range = movingAveragePeriod;
        var lastSum = 0;
        for(var i = 0; i < bars.length; i++){
            var sum = 0;
            for(var j = 0; j < range; j++){
                if(bars[i - j]){
                    sum += bars[i - j];
                }
                if(bars[i + j]){
                    sum += bars[i + j];
                }
            }
            
            sum += bars[i];
            var average = sum / (range*2 + 1);
            points.push(average);
        }
        
        console.log(points);
    }
    
    function drawHorizontalLines(){
        numBars = 10;
        var barDifference = height/numBars;
        var cursor = { x:0, y:height }
        
        ctx.fillStyle=labelColor;
        for(var i = 0; i < numBars; i++){
            ctx.fillRect(cursor.x,cursor.y,width,1);
            cursor.y -= barDifference;
        }
        ctx.fillStyle = "black";
    }
    
    function drawHorizontalLabels(){
        var maxValue = -1;
        
        // [ Find max value ]
        for(var i = 0; i < bars.length; i++){
            maxValue = Math.max(bars[i],maxValue);
        }
        
        
        numBars = 10;
        var textPadding = 5;
        var barDifference = height/numBars;
        var cursor = { x:0, y:height }
        var stepDifference = Math.round(maxValue/numBars);
        var steps = 0;
        
        ctx.fillStyle=labelColor;
        for(var i = 0; i < numBars; i++){
            ctx.font = "100 14px Arial";
            ctx.fillText(steps,cursor.x + textPadding*2,cursor.y - textPadding);
            cursor.y -= barDifference;
            steps += stepDifference;
        }
        ctx.fillStyle="black";     
    }
    
    function drawBars(){
        var maxValue = -1;
        
        // [ Find max value ]
        for(var i = 0; i < bars.length; i++){
            maxValue = Math.max(bars[i],maxValue);
        }
        
        ctx.globalAlpha = 0.8;
        var cursor = { x:0, y:height }
        for(var i = 0; i < bars.length; i++){
            var value = bars[i];
            var barHeight = value/maxValue*height;
            ctx.fillRect(cursor.x,cursor.y - barHeight,barWidth,barHeight);
            cursor.x += barWidth + barWidth/2;
        }
        ctx.globalAlpha = 1;
    }
    
    function drawLineOfBestFit(){
        ctx.save();
        
        var maxValue = -1;
        
        // [ Find max value ]
        for(var i = 0; i < bars.length; i++){
            maxValue = Math.max(bars[i],maxValue);
        }
        
        var heightConverter = height/maxValue;
        var y1 = height - lineOfBestFit.at(min)*heightConverter;
        var y2 = height - lineOfBestFit.at(max)*heightConverter;
        
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(0,y1);   
        ctx.lineTo(width,y2);
        ctx.stroke();
        ctx.closePath();
        
        
        ctx.restore();
    }
            
    function drawMovingAverage(){
        ctx.save();
        
        var maxValue = -1;
        
        // [ Find max value ]
        for(var i = 0; i < bars.length; i++){
            maxValue = Math.max(bars[i],maxValue);
        }
        

        
        ctx.strokeStyle = '#E8E035';
        ctx.lineWidth=1;
        ctx.beginPath();
        
        var heightConverter = height/maxValue;
        var cursor = { x:0, y:0 }
        for(var i = 0; i < points.length; i++){
            if(i < movingAveragePeriod){
                cursor.x += barWidth + barWidth/2;
                continue;
            }
            
            if(points.length - movingAveragePeriod < i) continue;
            
            cursor.y = height - points[i]*heightConverter;
            
            if(i <= movingAveragePeriod){
                ctx.moveTo(cursor.x,cursor.y);
            }else{
                ctx.lineTo(cursor.x,cursor.y);
            }
            
            cursor.x += barWidth + barWidth/2;
        }

        ctx.stroke();
        ctx.closePath();
        
        
        ctx.restore(); 
    }
    
    this.calculate = function(newMin,newMax,newMovingAveragePeriod){
        if(!newMin){
            newMin = 1;
        }
        
        if(!newMax){
            newMax = 10000;
        }
        min = newMin*1;
        max = newMax*1;
        
        if(!newMovingAveragePeriod){
            newMovingAveragePeriod = defaultMovingAveragePeriod;
        }
        
        movingAveragePeriod = newMovingAveragePeriod;
        
        barWidth = width/((max - min)*1.5);
        recalculate();
        invalidate();
    }
    
    this.toggleGrid = function(){
        showLabels = !showLabels;
        invalidate();
    }
    
    this.changeMovingAveragePeriod = function(newMovingAveragePeriod){
        movingAveragePeriod = newMovingAveragePeriod;
        calculateSimpleMovingAverage();
        invalidate();
    }
    
    this.toggleLineOfBestFit = function(){
        showLineOfBestFit = !showLineOfBestFit;
        invalidate();
    }
    
    this.toggleMovingAverage = function(){
        showMovingAverage = !showMovingAverage;
        invalidate();  
    }
    
    // [ Draw initial chart ]
    recalculate();
    invalidate();
}

if(exports){
    exports = Misual;
}