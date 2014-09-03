tasksController = function(){
	var taskPage;
	var initialised = false;
	function errorLogger(errorCode, errorMessage){
		console.log(errorCode+':'+errorMessage);
	};
	
	function taskCountChanged(){
		var count = $(taskPage).find('#tblTasks tbody tr').length;
		$('footer').find('#taskCount').text(count);
	}
	function clearTask(){
		$(taskPage).find('form').fromObject({});
	}
	
	function renderTable() { 
		$.each($(taskPage).find('#tblTasks tbody tr'), function( idx, row) {
				var due = Date.parse($(row).find('[datetime]').text());
				if (due.compareTo(Date.today()) < 0) { 
					$(row).addClass("overdue"); 
				} else if (due.compareTo((2).days().fromNow()) <= 0) { 
					$(row).addClass("warning"); 
				} 
		}); 
	}

	
	
	return {

		init: function(page){

			storageEngine.init(
					function(){
						storageEngine.initObjectStore('task',function(){},errorLogger);
					},
					errorLogger);

			if(!initialised){
				
				taskPage=page;
				
				
				$(taskPage).find('[required="required"]').prev('label').append('<span>*</span>').children('span').addClass('required'); 
				$(taskPage).find('tbody tr:even').addClass('even'); 
				$(taskPage).find('#btnAddTask').click(
						function (evt){
							evt.preventDefault();
							$('#taskCreation').removeClass('not');
						}
						);
				$(taskPage).find('tbody tr').click(
						function(evt){
							$(evt.target).closest('td').siblings().andSelf().toggleClass('rowHighlight');
						}
						);	
				$(taskPage).find('#tblTasks tbody').on('click','.deleteRow', function(evt){
					evt.preventDefault();
					storageEngine.deleteById('task',$(evt.target).data().taskId, function(){
						$(evt.target).parents('tr').remove();
						taskCountChanged();
					},errorLogger);
				});
				$(taskPage).find('#tblTasks tbody').on('click','.editRow', function(evt){
					evt.preventDefault();
					$(taskPage).find('#taskCreation').removeClass('not');
					storageEngine.findById('task',$(evt.target).data().taskId, function(task){
						$(taskPage).find('form').fromObject(task);
					},errorLogger);
				});	
				
				$(taskPage).find('#tblTasks tbody').on('click','.completeRow', function(evt){
					evt.preventDefault();
					storageEngine.findById('task',$(evt.target).data().taskId, function(task){
						task.complete=true;
						storageEngine.save('task', task, function(){
							tasksController.loadTasks(taskPage);
						},errorLogger);
					},errorLogger);
				});	
				
				//$(taskPage).find('#tblTasks tbody tr:first').clone().insertAfter('#tblTasks tbody tr:last');
				
				$(taskPage).find('#saveTask').click(function(evt){
					evt.preventDefault();
					if($(taskPage).find('form').valid()){
						var task = $(taskPage).find('form').toObject();
						storageEngine.save('task',task, function(){
							$(taskPage).find('#tblTasks tbody').empty();
							tasksController.loadTasks(taskPage);
							//$(':input').val("");
							clearTask();
							$(taskPage).find('#taskCreation').addClass('not');
						},errorLogger);
						
					}
					
				});
				$(taskPage).find('#clearTask').click(function (evt){
					evt.preventDefault();
					clearTask();
				});
				initialised =  true;
			}
		},
		loadTasks:function(page){
			$(taskPage).find('#tblTasks tbody').empty();
			storageEngine.findAll('task', function(tasks) { 
				tasks.sort(function(o1,o2){
					return Date.parse(o1.requiredBy).compareTo(Date.parse(o2.requiredBy));
				});
				$.each(tasks, function( index, task) { 
					taskPage=page;
					if(!task.complete){
						task.complete=false;
					}
					$('#taskRow').tmpl(task).appendTo($(taskPage).find('#tblTasks tbody')); 
					});
				taskCountChanged();
				renderTable();
				}, errorLogger);
		}
	};
}();
