function handle_sections(data) {
  for(var area in data) {
    $('#area_' + area).append('<ul>');
    var ul = $('<ul>');
    for(var section in data[area]) {
      $('#section').append('<option value="' + section + '">' + section + '</option>');
      ul.append('<li id="' + section + '"><abbr title="' + data[area][section] + '">' + section + '</abbr></li>');
    }
    if(area != 'DX') $('#area_' + area).append(ul);
  }
  var sections = $('#section').children('option');
  sections.sort(function(a,b) {
    if(a.value > b.value) return 1;
    if(a.value < b.value) return -1;
    return 0;
  });
  sections.detach().appendTo($('#section'));
  $('#section').val('');
}

function handle_status(data) {
  $('#last20 tbody tr').remove();
  $.each(data.last20, function(i, contact) {
    var tr = $('<tr>');
    $.each(contact, function(i, item) {
      if(i == 2) {
        if(item == 'PH') item = 'Phone';
        if(item == 'DIG') item = 'Digital';
      }
      else if(i == 5) {
        item = (new Date(item * 1000)).toISOString().substring(11,19);
      }
      tr.append($('<td>' + item + '</td>'));
    });
    $('#last20 tbody').append(tr);
  });
  $.each(data.sections_worked, function(i, section) {
    $('#' + section).addClass('worked');
  });
}

function submit_form() {
  if($('#call').hasClass('dup')) {
    alert('Duplicate!');
    return false;
  }
  var data = { 'call': $('#call').val(),
               'band': $('#band').val(),
               'mode': $('#mode').val(),
               'class': $('#class').val(),
               'section': $('#section').val(),
               'operator': $('#operator').val(),
               'logger': $('#logger').val() };
  $.post('add.pl', data, handle_status, 'json');
  $('#call').val('');
  $('#class').val('');
  $('#section').val('');
  return false;
}

$(document).ready(function() { 
  $('#operator').val($.cookie('operator'));
  $('#logger').val($.cookie('logger'));
  $('#band').val($.cookie('band'));
  $('#mode').val($.cookie('mode'));
  $(log_form).submit(submit_form);
  $.getJSON('data/sections.json', {}, handle_sections);
  (function poll() {
     $.ajax({ url: 'data/status.json', success: handle_status, dataType: 'json',
            complete: poll, timeout: 15000});
  })();
  $('#operator').change(function() {
    var operator = $('#operator').val().toUpperCase();
    $('#operator').val(operator);
    $.cookie('operator', operator, { expires: 7 });
  });
  $('#logger').change(function() {
    var logger = $('#logger').val().toUpperCase();
    $('#logger').val(logger);
    $.cookie('logger', logger, { expires: 7 });
  });
  $('#band').change(function() {
     $.cookie('band', $('#band').val(), { expires: 7 });
  });
  $('#mode').change(function() {
     $.cookie('mode', $('#mode').val(), { expires: 7 });
  });
  $('#call').change(function() {
    $('#call').val($('#call').val().toUpperCase());
    $('#call').removeClass('dup');
    $('#class').removeClass('dup');
    $('#section').removeClass('dup');
    $.getJSON('dup.pl', { call: $('#call').val() }, function(data) {
      if(data.length) {
        $('#class').val(data[3]);
        $('#section').val(data[4]);
        if(data[1] == $('#band').val() && data[2] == $('#mode').val()) {
          $('#call').addClass('dup');
          $('#class').addClass('dup');
          $('#section').addClass('dup');
        }
      }
    });
  });
  $('#class').change(function() {
    $('#class').val($('#class').val().toUpperCase());
  });
});
