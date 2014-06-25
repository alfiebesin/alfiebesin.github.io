$(document).ready(function(){
	var site = 'http://'+window.location.hostname+'/';

	/**
	 * Func to add comments on modal
	 */
	$('div.comment-form form#form_comments').validate({
		rules: {
			comment_msg: {
				required: true
			}
		},

		messages: {
			comment_msg: {
				required: 'Comment message cannot be empty.'
			}
		},

		submitHandler: function(form) {
			var msg = $(form).find('textarea[name=comment_msg]')
			var selected = $(form).find('input:hidden[name=buyer_id]').val()
			var comment_created = $.datepicker.formatDate('dd, M yy', new Date())
			var comment_created_by = $(form).find('input:hidden[name=comment_created_by]').val()
			var comments_count = $('div#comments_modal').find('div.modal-header').find('h4.modal-title').find('span')

			var selected_row = $('table#table_leads').find('tr.row-'+selected)
			var new_comment_count = comments_count.text().replace('(', '').replace(')', '')
			new_comment_count = parseInt(new_comment_count)
			new_comment_count++;

			$.ajax({
				url: form.action,
				type: 'post',
				data: {lead_id: selected, msg: msg.val() },
				success: function(data){
					
					comments_count.text('('+new_comment_count+')') // update comments count

					var single_comment = '<li><input type="hidden" name="comment_id" value="'+data+'"><p class="created-by">'+comment_created_by+'<span class="pull-right comments-action"><a href="#" class="show-comment-edit" title="Edit this comment"><span class="glyphicon glyphicon-pencil"></span></a><a href="#" class="comment-remove" title="Remove this comment"><span class="glyphicon glyphicon-remove"></span></a></span></p><p class="comment-msg"><span class="message">'+msg.val()+'</span><br><span class="comment-created">'+comment_created+'</span></p><form class="form-comment-edit hide" action="http://www2.bloqresidences.ph/ajax_leads/edit_comment" method="post"><textarea rows="3" class="form-control" name="comment_msg">'+msg.val()+'</textarea><input type="submit" value="Update comment" class="btn btn-success btn-sm comment-update" style="margin: 0 0 0 0px;"><a href="" class="cancel-form-edit" style="font-size: 14px;margin: 0 0 0 10px;">cancel</a></form></li>'

					var comments = $('div#comments_modal').find('div.comments').find('ul')

					comments.prepend(single_comment) // add new comment to comments
					selected_row.find('td.lead-comments').find('a.show-comments-on-buyer').text(new_comment_count) // increment current lead comments count in front page
					msg.val('') // empty comment form

				},
				error: function(xhr, ajaxOptions, thrownError){
					alert('Unable to access server at this time, please try again.');
				}
			});
			
			return false;
		}

	});

	/**
	 * Edit buyer information - modal
	 * Add validation
	 * Update buyer information on modal
	 */
	$('form#update_buyer_details').validate({
		rules: {
			name: {
				required: true
			},
			email: {
				required: true,
				email: true
			},
			contact_number: {
				required: true,
				number: true
			},
			contact_number_secondary: {
				number: true
			},
			agent_name: {
				required: {
					depends: function(element) {
						var lead_has_agent = $('form#update_buyer_details').find('select.lead-has-agent')
						return (lead_has_agent.val() == 'Y');
					}
				}
			},
			agent_email: {
				required: {
					depends: function(element) {
						var lead_has_agent = $('form#update_buyer_details').find('select.lead-has-agent')
						return (lead_has_agent.val() == 'Y');
					}
				},
				email: {
					required: {
						depends: function(element) {
							var lead_has_agent = $('form#update_buyer_details').find('select.lead-has-agent')
							return (lead_has_agent.val() == 'Y');
						}
					}
				}
			}
		},

		submitHandler: function(form) {
			
			// update current lead details
			var selected_lead = $(form).find('input:hidden').val()
			var lead_name = $('#table_leads').find('tr.row-'+selected_lead).find('td.lead-name')
			var lead_phone_td = $('#table_leads').find('tr.row-'+selected_lead).find('td.lead-contact-number')
			var lead_phone = $('#table_leads').find('tr.row-'+selected_lead).find('td.lead-contact-number span.primary-phone')
			var lead_phone_secondary = $('#table_leads').find('tr.row-'+selected_lead).find('td.lead-contact-number span.secondary-phone')
			var lead_email = $('#table_leads').find('tr.row-'+selected_lead).find('td.lead-email').find('span.container-email')

			// update agent info
			var lead_agent_details = $('#table_leads').find('tr.row-'+selected_lead).find('td.lead-has-agent')
			var lead_has_agent = $('#table_leads').find('tr.row-'+selected_lead).find('td.lead-has-agent').find('input:hidden[name=has_agent]')

			lead_agent_details.find('span.lead-agent-email').find('script').remove() // remove script under email address

			$.ajax({
				url: $(form).attr('action'),
				type: 'post',
				data: $(form).serialize(),
				success: function(data){
					if(data) {
						lead_name.text($(form).find('input:text[name=name]').val())
						// lead_phone.text($(form).find('input:text[name=contact_number]').val())
						lead_email.text($(form).find('input:text[name=email]').val())

						if($(form).find('select.lead-has-agent').val() == 'Y') {
							lead_agent_details.empty().append('<input type="hidden" name="has_agent" value="Y"><span class="lead-agent-name">'+$(form).find('input:text[name=agent_name]').val()+'</span><br><span class="lead-agent-email">'+$(form).find('input:text[name=agent_email]').val()+'</span>')
						} else {
							lead_agent_details.empty().append('<input type="hidden" name="has_agent" value="N">NO')
						}

						// if form has secondary contact number, add secondary to the dom
						if($(form).find('input:text[name=contact_number_secondary]').val()) {
							var contact_with_secondary = '<small><span class="label label-phone primary-phone phone-sun" title="Sun" style="display: inline-block;">'+$(form).find('input:text[name=contact_number]').val()+'</span></small><small><span class="label label-phone secondary-phone label-pending" style="display: inline-block; margin: 0 0 0 4px;">'+$(form).find('input:text[name=contact_number_secondary]').val()+'</span></small>'

							lead_phone_td.empty().html(contact_with_secondary)
						}

						// if secondary contact is empty and secondary contact is available in the dom, remove secondary contact html
						if(!$(form).find('input:text[name=contact_number_secondary]').val() && lead_phone_secondary.text()) {
							var contact_only_primary = '<span class="label label-stat label-phone primary-phone label-pending">'+$(form).find('input:text[name=contact_number]').val()+'</span>'

							lead_phone_td.empty().html(contact_only_primary)
						}

						// console.log(lead_phone_secondary)

						$(form).closest('div.modal').modal('hide')
					}
				},
				error: function(xhr, ajaxOptions, thrownError){
					alert('Unable to access server at this time, please try again.');
				}
			});
			
			return false;
		}
	});

	$('input.datetimepicker').datetimepicker({
		format: 'yyyy-mm-dd',
		autoclose: true,
		todayBtn: 'linked',
		startView: 2,
		minView: 2
	})

	$("#bulk_update_called").on('click', function(){
		var selected = new Array();
		var selected_leads = $('input:checkbox[name="lead[]"]:checked');
		
		if(selected_leads.length > 0){
			// console.log(selected_leads)
			$.each(selected_leads, function(index, value){
				selected.push($(value).val())
			})
			
			$.ajax({
				url: site+'ajax_leads/bulk_update_called',
				type: 'post',
				data: {id: selected },
				success: function(data){
					if(data) {
						alert('Successfully changed status to Called');
						window.location.reload();
					}
				},
				error: function(xhr, ajaxOptions, thrownError){
					alert('Unable to access server at this time, please try again.');
				}
			});
			
			return false;
		}
		else {
			alert('Please select leads to change its status to Called');
		}
	});

	/*
	Func to delete single lead
	 */
	$('a.delete-single-lead').on('click', function(e){
		var selected = $(this).closest('tr').find('td').first().find('input:checkbox[name="lead[]"]').val()
		if(confirm('Delete this lead on the dashboard')) {

			$.ajax({
				url: site+'ajax_leads/delete_single_lead',
				type: 'post',
				data: {lead_id: selected },
				success: function(data){
					if(data) {
						alert('You successfully deleted this lead');
						$('#table_leads').find('input:checkbox[value='+selected+']').closest('tr').fadeOut()
					}
				},
				error: function(xhr, ajaxOptions, thrownError){
					alert('Unable to access server at this time, please try again.');
				}
			});
			
			return false;
		}

		e.preventDefault();
	});

	/**
	 * Func to show update modal box and update single lead information
	 */
	$('a.update-single-lead').on('click', function(e){
		$(this).closest('tr').find('td.lead-email').first().find('span.container-email').find('script').remove() // remove script tag in live

		var modal_update = $('div#lead_update_modal')
		var selected = $(this).closest('tr').attr('class').replace('row-', '')
		var lead_name = $(this).closest('tr').find('td.lead-name').first().text()
		var lead_phone = $(this).closest('tr').find('td.lead-contact-number').first().find('span.primary-phone').text()
		var lead_phone_secondary = $(this).closest('tr').find('td.lead-contact-number').first().find('span.secondary-phone').text()
		var lead_email = $(this).closest('tr').find('td.lead-email').first().find('span.container-email').text()

		var modal_selected_lead = modal_update.find('div.modal-body').find('input:hidden[name=lead_id]')
		var modal_lead_name = modal_update.find('div.modal-body').find('input:text[name=name]')
		var modal_lead_phone = modal_update.find('div.modal-body').find('input:text[name=contact_number]')
		var modal_lead_phone_secondary = modal_update.find('div.modal-body').find('input:text[name=contact_number_secondary]')
		var modal_lead_email = modal_update.find('div.modal-body').find('input:text[name=email]')

		// update has agent details, update buyer agents name and email
		var lead_has_agent = $(this).closest('tr').find('td.lead-has-agent').find('input:hidden[name=has_agent]')
		var lead_agent_name = $(this).closest('tr').find('td.lead-has-agent').find('span.lead-agent-name')
		var lead_agent_email = $(this).closest('tr').find('td.lead-has-agent').find('span.lead-agent-email')
		var select_has_agent = $('div#lead_update_modal').find('select.lead-has-agent')
		var buyer_agent_details = $('div.agent-details')

		selected = parseInt(selected)
		modal_selected_lead.val(selected)
		modal_lead_name.val(lead_name)
		modal_lead_phone.val(lead_phone)
		modal_lead_phone_secondary.val(lead_phone_secondary)
		modal_lead_email.val(lead_email)

		select_has_agent.val(lead_has_agent.val())

		if(lead_has_agent.val() == 'Y') {
			buyer_agent_details.removeClass('hide')
			lead_agent_email.find('script').remove() // remove script under buyer agents email

			// update agent name and email
			modal_update.find('form#update_buyer_details').find('input:text[name=agent_name]').val(lead_agent_name.text())
			modal_update.find('form#update_buyer_details').find('input:text[name=agent_email]').val(lead_agent_email.text())

		} else {
			buyer_agent_details.addClass('hide')
		}

		e.preventDefault(modal_lead_name.val());
	});

	$('a.send-buyer-details').on('click', function(e){
		
		$(this).closest('tr').find('td.lead-email').first().find('span.container-email').find('script').remove() // remove script tag in live

		var selected = $(this).closest('tr').find('td').first().find('input:checkbox[name="lead[]"]').val()
		var selected_name = $(this).closest('tr').find('td.lead-name').first().html()
		var selected_email = $(this).closest('tr').find('td.lead-email').first().find('span.container-email').text()
		
		var selected_phone = $(this).closest('tr').find('td.lead-contact-number').first().html()

		$(this).closest('td').append('<span class="glyphicon glyphicon-envelope sent-acropolis" title="Buyer details was sent to Acropolis"></span>').find('a:nth-child(3)').remove()

		$.ajax({
			url: site+'ajax_leads/notify_acropolis_new_buyer',
			type: 'post',
			data: {name: selected_name, email: selected_email, phone: selected_phone, lead_id: selected},
			success: function(data){
				if(data) {
					alert('Successfully send buyer details to Acropolis')
				}
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert('Unable to access server at this time, please try again.');
			}
		});
		
		return false;
		e.preventDefault();
	});

	// Func to redirect to single lead page // COMMENT FOR NOW
	$('#table_leads tr').find('td').not('.not-clickable').on('click', function(){
		var link = $(this).closest('tr').attr('href')
		window.location.href=link
	});

	/* Func to show/ hide comment box */
	$('a.comment-edit').on('click', function(e){
		var selected_comment_id = $(this).closest('div.comments-action').find('input[name=comment_id]').val()
		var form_edit_comment = $(this).closest('div.ticket-info').find('div.form-update-comment')
		var curr_comment = $(this).closest('div.ticket-info').find('p.comment-msg')

		if(form_edit_comment.hasClass('hide')) {
			curr_comment.addClass('hide')
			form_edit_comment.removeClass('hide')
		} else {
			curr_comment.removeClass('hide')
			form_edit_comment.addClass('hide')
		}

		e.preventDefault();
	});

	/* Func to edit comment*/ 
	$('button.update-single-comment').on('click', function(){
		var curr_comment_msg = $(this).closest('div.ticket-info').find('p.comment-msg')
		var new_comment_msg = $(this).closest('div.form-update-comment').find('textarea[name=message]').val()
		var selected_comment_id = $(this).closest('div.ticket-info').find('input[name=comment_id]').val()
		var form_edit_comment = $(this).closest('div.form-update-comment')

		$.ajax({
			url: site+'comments/update',
			type: 'post',
			data: {comment_id: selected_comment_id, message: new_comment_msg },
			success: function(data){
				if(data) {
					// update old comment msg, close the edit comment form
					form_edit_comment.addClass('hide')
					curr_comment_msg.removeClass('hide').text(new_comment_msg)
				}
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert('Unable to access server at this time, please try again.');
			}
		});
		
		return false;
	})

	/* Func to delete comment */
	$('a.comment-delete').on('click', function(e){
		var selected_comment_id = $(this).closest('div.comments-action').find('input[name=comment_id]').val()
		
		$.ajax({
			url: site+'comments/delete',
			type: 'post',
			data: {comment_id: selected_comment_id },
			success: function(data){
				if(data) {
					window.location.reload();
				}
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert('Unable to access server at this time, please try again.');
			}
		});
		
		return false;

		e.preventDefault();
	});

	// Func to change lead status in the front page
	$('select.select-change-status').on('change', function(){
		var selected_lead = $(this).closest('tr').find('td').first().find('input:checkbox[name="lead[]"]').val()
		var new_status = $(this).val()
		var curr_status = $(this).parent('td').find('input:hidden[name=curr_status]')

		if(new_status != 0) {
			if(confirm('Change lead status to '+new_status+'?')) {
				$.ajax({
					url: site+'ajax_leads/update_single_lead',
					type: 'post',
					data: {lead_id: selected_lead, status: new_status },
					success: function(data){
						curr_status.val(new_status)
						if(data) {
							alert('Successfully changed lead status to '+new_status)
						}
					},
					error: function(xhr, ajaxOptions, thrownError){
						alert('Unable to access server at this time, please try again.');
					}
				});
				
				return false;
			}
		}

	});

	// Func to show comments on modal
	$('a.show-comments-on-buyer').on('click', function(){
		$(this).closest('tr').find('td.lead-email').find('span.container-email').find('script').remove() // script tag in live

		var comments_modal = $('div#comments_modal')
		var comments_container = $('div#comments_modal').find('div.comments')
		var selected = $(this).closest('tr').find('td').first().find('input:checkbox[name="lead[]"]').val()
		var selected_name = $(this).closest('tr').find('td.lead-name').text()
		
		var selected_email = $(this).closest('tr').find('td.lead-email').find('span.container-email').text()

		var selected_phone = $(this).closest('tr').find('td.lead-contact-number').text()
		var buyer_name = comments_modal.find('div.modal-body').find('span.buyer-name').text(selected_name)
		var buyer_email = comments_modal.find('div.modal-body').find('span.buyer-email').text(selected_email)
		var buyer_phone = comments_modal.find('div.modal-body').find('span.buyer-phone').text(buyer_phone)
		var buyer_id = comments_modal.find('div.modal-body').find('input:hidden[name=buyer_id]').val(selected)

		// clear comment box
		var comment_msg = comments_modal.find('div.modal-body').find('textarea[name=comment_msg]')
		comment_msg.val('')

		$.getJSON(site+'ajax_leads/get_comments_on_buyer/'+selected, function(data) {
			var comments_count = data.length
			var comments = $('<ul></ul>');

			// update commetns count
			if(typeof comments_count === 'undefined') {
				comments_modal.find('div.modal-header').find('h4.modal-title').find('span').text('(0)')

			} else {
				comments_modal.find('div.modal-header').find('h4.modal-title').find('span').text('('+comments_count+')')
			}

			$.each(data, function(k, v){
				// update comments 
				v.date_created = $.datepicker.formatDate('dd, M yy', new Date(v.date_created))
				comments.append('<li><input type="hidden" name="comment_id" value="'+v.id+'"><p class="created-by">'+v.created_by_name+'<span class="pull-right comments-action"><a href="#" class="show-comment-edit" title="Edit this comment"><span class="glyphicon glyphicon-pencil"></span></a><a href="#" class="comment-remove" title="Remove this comment"><span class="glyphicon glyphicon-remove"></span></a></span></p>'+'<p class="comment-msg"><span class="message">'+v.message+'</span><br/><span class="comment-created">'+v.date_created+'</span></p><form class="form-comment-edit hide" action="'+site+'ajax_leads/edit_comment" method="post"><textarea rows="3" class="form-control" name="comment_msg">'+v.message+'</textarea><input type="submit" value="Update comment" class="btn btn-success btn-sm comment-update" style="margin: 0 0 0 0px;"><a href="" class="cancel-form-edit" style="font-size: 14px;margin: 0 0 0 10px;">cancel</a></form><li>')
			});

			comments_container.empty().html(comments)
		});
		
	});

	/**
	 * Func to show/ hide agent name and email
	 */
	$('select.lead-has-agent').on('change', function(){
		var has_agent = $(this).val()
		var agent_details = $('div.agent-details')

		if(has_agent == 'Y') {
			agent_details.removeClass('hide')
		} else {
			agent_details.addClass('hide')
		}
	});


});

/**
 * Func to show edit comment form
 */
$(document).on('click', 'a.show-comment-edit, a.cancel-form-edit', function(e){
	// console.log('test')
	var comment_id = $(this).closest('li').find('input:hidden[name=comment_id]').val()
	var form_edit_comments = $(this).closest('li').find('form.form-comment-edit')
	var comment_msg = $(this).closest('li').find('p.comment-msg')

	if(form_edit_comments.hasClass('hide')) {
		form_edit_comments.removeClass('hide')
	} else {
		form_edit_comments.addClass('hide')
	}

	if(comment_msg.hasClass('hide')) {
		comment_msg.removeClass('hide')
	} else {
		comment_msg.addClass('hide')
	}
	
	e.preventDefault();
});

/**
 * Func to delete comment form
 */
$(document).on('click', 'input.comment-update', function(e){
	var comment_id = $(this).closest('li').find('input:hidden[name=comment_id]').val()
	var form_edit_comments = $(this).closest('form.form-comment-edit')
	var comment_msg = form_edit_comments.find('textarea[name=comment_msg]').val()
	var comment_box = $(this).closest('li').find('p.comment-msg')

	// console.log(comments_count)

	$.ajax({
		url: form_edit_comments.attr('action'),
		type: 'post',
		data: {comment_id: comment_id, message: comment_msg },
		success: function(data){
			if(data) {
				comment_box.find('span.message').text(comment_msg) // update comment message
				form_edit_comments.addClass('hide') // close comment form
				comment_box.removeClass('hide') // show coment box
			}
			
		},
		error: function(xhr, ajaxOptions, thrownError){
			alert('Unable to access server at this time, please try again.');
		}
	});
	
	return false;
	
	e.preventDefault();
});

/**
 * Func to delete comment form
 */
$(document).on('click', 'a.comment-remove', function(e){
	var site = 'http://'+window.location.hostname+'/';
	var comments_modal = $('div#comments_modal')
	var comments_count_box = comments_modal.find('div.modal-header').find('h4').find('span.comments-on-buyer')
	var comments_count = parseInt(comments_count_box.text().replace('(', '').replace(')',''))

	var comment_id = $(this).closest('li').find('input:hidden[name=comment_id]').val()
	var comment_box =$(this).closest('li')

	var selected = $(this).closest('div.modal-body').find('div.comment-form').find('input:hidden[name=buyer_id]').val()
	var selected_row = $('table#table_leads').find('tr.row-'+selected)

	if(confirm('Delete this comment?')) {
		$.ajax({
			url: site+'ajax_leads/remove_comment',
			type: 'post',
			data: {comment_id: comment_id },
			success: function(data){
				if(data) {
					comment_box.fadeOut(); // remove comment box
					comments_count = comments_count - 1; // decrement comments count by 1
					comments_count_box.text('('+comments_count+')') 
					selected_row.find('td.lead-comments').find('a.show-comments-on-buyer').text(comments_count) // decrement comments count by 1 in front page
				}
				
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert('Unable to access server at this time, please try again.');
			}
		});
		
		return false;
	}
	
	e.preventDefault();
});
