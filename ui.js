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
  $('#band').val('');
  $('#mode').val('');
  $(log_form).submit(submit_form);
  $.getJSON('data/sections.json', {}, handle_sections);
  (function poll() {
     $.ajax({ url: 'data/status.json', success: handle_status, dataType: 'json',
            complete: poll, timeout: 15000});
  })();
  $('#operator').change(function() { $('#operator').val($('#operator').val().toUpperCase()); });
  $('#logger').change(function() { $('#logger').val($('#logger').val().toUpperCase()); });
  $('#call').change(function() { $('#call').val($('#call').val().toUpperCase()); });
  $('#class').change(function() { $('#class').val($('#class').val().toUpperCase()); });
});
