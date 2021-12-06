function header_hide(){  
    //页面初始化的时候，获取滚动条的高度（上次高度）  
    var start_height = $(document).scrollTop();  
    //获取导航栏的高度(包含 padding 和 border)  
    var header_height = $('nav').outerHeight(); 

    $(window).scroll(function() {  
        //触发滚动事件后，滚动条的高度（本次高度）  
        var current_height = $(document).scrollTop();  
        //触发后的高度 与 元素的高度对比  
        if (current_height > header_height){ 
            $('nav').addClass('hide');  
        }else {  
            $('nav').removeClass('hide');
        }  
        //触发后的高度 与 上次触发后的高度  
        if (current_height < start_height){  
            $('nav').removeClass('hide');  
        }  
        //再次获取滚动条的高度，用于下次触发事件后的对比  
        start_height = $(document).scrollTop();  
    });  
}; 

header_hide();















