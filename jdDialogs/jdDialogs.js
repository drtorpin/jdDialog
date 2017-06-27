/** Pavlov Kirill drtorpin
  * v 1.1.0
  * замена стандартным диалоговым окнам с возвратом в точку вызова
  * в данной версии реализована только замена alert, confirm, приведён пример 3-х кнопочного окна
 **/


 
 (function($) {

	var methods = {		
	jdCheckId : function(t) {
		var id = $(t).attr('id');
		if(!id) {
			var data = new Date().getTime();
			var rnd = Math.floor(Math.random() * 1000);
			id = 'jd'+data+rnd;
			$(t).attr('id',id);
			}
		return id;
		},
	jdDialog : function(type,fid,data,t,fname) {
		if( !!!$(t).data('jdReclick') ) {
			// живой вызов - очистить транзиитную сессию
			methods.jdClear(t);
			} else {
			// транзитный вызов - проверить назначены ли данные, вернуть если да
			var passtage = $(t).data( String(fid) );
			// кнопка в этом окне уже нажималась - возвращаем результат "транзита"
			if(!!passtage) {
				// if(fid == 0) methods.jdClear(t);
				if(!fid) methods.jdClear(t);
				return passtage;
				}
			}
		// сохраняем id текущего окна для передачи обработчику выбора jdSetAnswer
		$(t).data('jdFname',fid);
		$(methods.jdGetWin(type,data,methods.jdCheckId(t),fname)).appendTo(document.body).show('slow');
		return 0;
		},
	jdReclick : function(id) {		
		$(id).data('jdReclick','1').click();
		},
	jdClear : function (t) {
		$(t).removeData('jdReclick');
		$(t).removeData('jdFname');
		$.each($(t).data(), function( index, value ) {		  
		  $(t).removeData(index);
		  });		
		// $.removeData( $(t).attr('id') );
		},
	// ответ по нажатию кнопки
	jdSetAnswer : function(value,t) {
		var id = '#'+$('.jdBody').attr('data-jdIdBackTag');
		var fname = String( $(id).data('jdFname') );
		$(id).data(fname,value);
		$('.jdModalBg').detach().fadeIn(10,function() {	
			var fncdo = $(t).attr('data-fncdo');
			// очищаем транзитную сессию если отмена
			if(!value) {
				methods.jdClear(id);
				return;
				}
			// если указана функция вызываем её
			if(!!fncdo) window[fncdo]();
				// запускаем транзитный вызов
				methods.jdReclick(id);
			});		
		},	
	jdGetWin : function(type,data,id,fname) {
		var fncdo = fname ? ' data-fncdo="'+fname+'"' : '';
		var text = data[0];
		var title = data[1];
		switch(type) {
			case 'Alert':
				jdBttns = '<button class="jdOk jdOk1"'+fncdo+'>Дальше</button>';
				// clClass = 'jdClose1';
				clClass = 'jdClose0';
			break;
			case 'Confirm':
				jdBttns = '<button class="jdOk jdOk1">Да</button>'+
						  '<button class="jdCancel">Отмена</button>';
				clClass = 'jdClose0';
			break;
			case 'Confirm2bttn':
				var bttntext1 = data[2];
				var bttntext2 = data[3];
				jdBttns = '<button class="jdOk jdOk1">'+bttntext1+'</button>'+
						  '<button class="jdOk jdOk2">'+bttntext2+'</button>'+
						  '<button class="jdCancel">Отмена</button>';
				clClass = 'jdClose0';
			break;
			default:
				return 0;
			}		
		jdBody = '<div class="jdModalBg">'+
					'<div class="jdDialog jdDialog'+type+'">'+
						'<div class="jdHeader">'+
							'<div class="jdLeft jdTitle">'+title+'</div>'+
							'<div class="jdClose '+clClass+'"'+fncdo+'>'+
								'<div>&times;</div>'+
							'</div>'+
							'<div class="jbClr"></div>'+
						'</div>'+
						'<div class="jdBody" data-jdIdBackTag="'+id+'">'+
							'<div class="jdText">'+text+'</div>'+
							'<div class="jdBttns">'+jdBttns+'</div>'+
						'</div>'+
					'</div>'+
				  '</div>';			
		return jdBody;
		},		
	al : function(fid,data,fname) {
		return methods.jdDialog('Alert',fid,data,$(this),fname);
		},		
	alert : function(fid,data,fname) {
		return methods.jdDialog('Alert',fid,data,$(this),fname);
		},
	cnf : function(fid,data,fname) {
		return methods.jdDialog('Confirm',fid,data,$(this),fname);
		},
	confirm : function(fid,data,fname) {
		return methods.jdDialog('Confirm',fid,data,$(this),fname);
		},
	confirm2bttn : function(fid,data,fname) {
		return methods.jdDialog('Confirm2bttn',fid,data,$(this),fname);
		}	
	}
 
		// события кнопок	
	$(document)
		.on('click','.jdOk2', function() {			
			methods.jdSetAnswer(2,$(this));
			})
		.on('click','.jdOk1', function() {			
			methods.jdSetAnswer(1,$(this));
			})
		.on('click','.jdClose1', function() {
			methods.jdSetAnswer(1,$(this));
			})
		.on('click','.jdClose0', function() {
			methods.jdSetAnswer(0,$(this));
			})
		.on('click','.jdCancel', function() {
			methods.jdSetAnswer(0,$(this));
			});
		
		
 	  jQuery.fn.jdDialogs = function(method) {	
		// логика вызова метода
		if ( methods[method] ) {
		  return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
		  return methods.init.apply( this, arguments );
		} else {
		  $.error( 'Метод с именем ' +  method + ' не существует для jQuery.jdDialogs' );
		} 
	  }
 })(jQuery);	
 
 
 

/** Принципы работы и ограничения:  
  * Возврат в точку вызова осуществляется запуском вызывающей функции ещё раз эмуляцией клика
  * Нужно обязательно указывать ID окна (второй параметр)
  * Последнее окно в функции должно иметь ID = 0
  * Можем указывать текст в шапке и в теле окна
  * Поэтому перед вызовом не должно быть кода, иначе будет запущено дважды
  * Требуется дополнять код проверкой ответа может быть 3 состояния:
  * 		0 - режим отрисовки диалогового окна
  *		0 - кнопка "Отказа" или "Закрытие окна"
  *		1 - кнопка "Подтверждения"
  *		2,3... - собственные подтверждения
  *	 в режиме отрисовки может понадобиться прерывать функцию if(cnfrm === false) return;
 **/

// Варианты вызова
// 1.Простое подтверждение
/*
	$('#test').click(function() {
		if($(this).jdDialogs('confirm',0,['Делаем?','Действие 1']) == 1) {
			...
			// alert(cnfrm);
			}
		});	
*/
// 2.Подтверждение с последущим уведомлением

		/*
		// вариант 1
		if( $(this).jdDialogs('confirm',1,['Делаем 6?','Действие 6']) ) {					
			if( $(this).jdDialogs('confirm',2,['Делаем 6 снова?','Действие 6 снова']) ) {					
				if( $(this).jdDialogs('alert',0,['Сделано!','Действие 6'],'answer1') ) {
					alert('Код выполнен');
					}
				}
			}
		// вариант 2	
		$('#test').click(function() {
			if(! $(this).jdDialogs('confirm',1,['Делаем 6?','Действие 6']) ) return;
			if(! $(this).jdDialogs('confirm',2,['Делаем 6 снова?','Действие 6 снова']) ) return;
			if(! $(this).jdDialogs('alert',0,['Сделано!','Действие 6'],'answer1') ) return;
			alert('Код выполнен');			
		*/
			
			
// 3.Два типа подтверждения
			/*
			switch($(this).jdDialogs('confirm2bttn',0,['Мы на перепутье','Действие шаг 3','Идти налево','Идти направо'])) {
				case 0: return;
				case 1:
					alert('Идём налево');
				break;
				case 2:
					alert('Идём направо');
				break;
				default:
					// alert('OK!!!');
				}			
			*/
			
