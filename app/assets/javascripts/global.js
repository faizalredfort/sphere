$(document).ready(function() {
  menuInit();
  keyboardShortcutsInit();
});

function menuInit() {
  var submenuBox = $('#submenu-box');
  
  $(submenuBox).css({height: 0});
  $('#submenu-box > .submenu').hide();
  
  slideSubMenuByMenuItem($('#main-menu > li.active').first().attr('id'), false);
  
  $('#main-menu > li > a').on('click', function() {
    return slideSubMenuByMenuItem($(this).parent('li').attr('id'), true);
  });
}

function slideSubMenuByMenuItem(htmlId, animated) {
  var submenuBox = $('#submenu-box');
  var menuItem = $('#' + htmlId);
  var relatedSubmenu = $('#submenu-box > .submenu[data-main-menu-relation="' + htmlId + '"]').first();
  var duration = animated ? 250 : 0;
  
  if($(submenuBox).is(':animated')) {
    return false;
  } else if (!htmlId || relatedSubmenu.length == 0 || menuItem.length == 0) {
    return true;
  } else {
    var menuItems = $('#main-menu > li');
    var submenus = $('#submenu-box > .submenu');
    
    $(menuItems).children('a').each(function(){
      var shortcutKey = getShortcutKeyById($(this).parent().attr('id'));
      if (shortcutKey) {
        var txt = $(this).text();
        var index = txt.toUpperCase().indexOf(shortcutKey);
        if (index >= 0) {
          $(this).html(txt.substring(0, index) + '<span class="shortcut-highlight">' + txt.substring(index, index + 1) + '</span>' + txt.substring(index + 1));
        }
      }
    });
    
    if ($(menuItem).hasClass('selected')) { /* Contract expanded submenu */
      $(menuItems).removeClass('selected');
      $(menuItems).children('a').each(function(){
        var shortcutKey = getShortcutKeyById($(this).parent().attr('id'));
        if (shortcutKey) {
          $(this).attr('title', jsLang.strings.expand_menu + ' [Alt+' + shortcutKey + ']');
        }
      });
      $(submenuBox).animate({height: 0}, duration, 'swing', function() {
        $(submenus).removeClass('selected').hide();
      });
    } else {
      $(menuItems).removeClass('selected');
      $(menuItems).children('a').each(function(){
        var shortcutKey = getShortcutKeyById($(this).parent().attr('id'));
        if (shortcutKey) {
          $(this).attr('title', jsLang.strings.expand_menu + ' [Alt+' + shortcutKey + ']');
        }
      });
      $(menuItem).addClass('selected');
      $(menuItem).children('a').each(function(){
        var shortcutKey = getShortcutKeyById($(this).parent().attr('id'));
        if (shortcutKey) {
          $(this).attr('title', jsLang.strings.contract_menu + ' [Alt+' + shortcutKey + ']');
        }
      });
      if ($(submenuBox).height() > 0) { /* Contract expanded submenu first, then expand requested submenu */
        $(submenuBox).animate({height: 0}, duration, 'swing', function() {
          $(submenus).removeClass('selected').hide();
          $(relatedSubmenu).addClass('selected').show();
          $(submenuBox).animate({height: relatedSubmenu.outerHeight(false)}, duration, 'swing', function() {
            $(this).css({height: 'auto'});
          });
        });
      } else { /* Expand requested submenu */
        $(submenus).removeClass('selected').hide();
        $(relatedSubmenu).addClass('selected').show();
        $(submenuBox).animate({height: relatedSubmenu.outerHeight(false)}, duration, 'swing', function(){
          $(this).css({height: 'auto'});
        });
      }
    }
    return false;
  }
}

function keyboardShortcutsInit() {
  $(document).keydown(function(event) {
    if(event.altKey) {
      var keyString = String.fromCharCode(event.which);
      $('#main-menu > li > a').each(function(){
        var menuItemId = $(this).parent().attr('id');
        var menuItemShortcutKey = getShortcutKeyById($(this).parent().attr('id'));
        if(keyString == menuItemShortcutKey) {
          return executeShortcut(menuItemId);
        }
      });
    }
  });
}

function executeShortcut(htmlId) {
  slideSubMenuByMenuItem(htmlId, true);
  return false;
}

function getShortcutKeyById(id) {
  var key = jsLang.shortcutKeys[id.replace(/[^a-zA-Z0-9]/g, '_')];
  if (typeof(key) != 'undefined' && key.length == 1) {
    return key.toUpperCase();
  } else {
    return false;
  }
}