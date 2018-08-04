WOW.prototype.addBox = function(element){
    this.boxes.push(element);
};

$('.wow').on('scrollSpy:exit',function(){
    var element = $(this);
    element.css({
        'visibility' : 'hidden',
        'animation-name' : 'none'
    }).removeClass('animated');
    wow.addBox(this);
});