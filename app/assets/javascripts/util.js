APP.util = {
  // XXX TODO docs
  fillDropdownWithItems: function(dropdown, items, options) {
    var options = $.extend({ prompt: false, empty: true }, options || {});
    if(options['empty']) {
      dropdown.empty();
    }
    if(options['prompt']) {
      $(new Option((typeof options['prompt'] === 'string' ? options['prompt'] : jsLang.global.prompt), null)).appendTo(dropdown);
    }
    for(key in items) {
      $(new Option(items[key], key)).appendTo(dropdown);
    }
    dropdown.cwicControl('recreate');
  },
  // XXX TODO docs
  getTranslationsForArray: function(array, library) {
    translations = {};
    for(i in array) {
      key = array[i];
      translations[key] = library.key;
    }
    return translations;
  }
}
