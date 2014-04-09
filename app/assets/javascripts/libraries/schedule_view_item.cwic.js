function CwicScheduleViewItem(_schedule, _scheduleEntity, _item_id) {
  this.schedule = _schedule;
  this.scheduleContainer = _schedule.scheduleContainer;
  this.scheduleEntity = _scheduleEntity || null;
  this.item_id = _item_id || null;

  this.hidden = false;
  this.focused = false;

  this.begin = null; // momentjs object
  this.end = null; // momentjs object

  this.conceptBegin = null; // momentjs object
  this.conceptEnd = null; // momentjs object
  this.conceptMode = false; // momentjs object


  this.bg_color = null;
  this.text_color = null;
  this.blocking = true;
  this.description = '';
  this.client_id = null;

  // slack times in minutes
  this.slack_before = 0;
  this.slack_after = 0;

  this.status = null;

  this.domObjects = {};
}

CwicScheduleViewItem.prototype.parseFromJSON = function(newItem) {
  this.item_id = newItem.id;
  this.begin = moment(newItem.begin_moment);
  this.end = moment(newItem.end_moment);
  this.bg_color = newItem.bg_color;
  this.text_color = newItem.text_color;
  this.description = newItem.description;
  this.client_id = newItem.client_id;
  this.blocking = newItem.blocking;

  this.slack_before = newItem.slack_before;
  this.slack_after = newItem.slack_after;

  if(newItem.status) {
    this.status  = {
                      bg_color: newItem.status.bg_color,
                      text_color: newItem.status.text_color,
                      name: newItem.status.name
                    };
  }
};

CwicScheduleViewItem.prototype.railsDataExport = function() {
  return { reservation: {
      reservation_id: this.item_id,
      begins_at: this.begin.format('YYYY-MM-DD HH:mm'),
      ends_at: this.end.format('YYYY-MM-DD HH:mm')
    }
  };
};

CwicScheduleViewItem.prototype.setSlack = function(before, after) {
  this.slack_before = before;
  this.slack_after = after;
};

CwicScheduleViewItem.prototype.applyGlow = function(kind, on) {
  var domObjectsSItems = $(this.getDomObjects()).find('div.schedule-item');
  (on) ? domObjectsSItems.addClass(kind + '-glow') : domObjectsSItems.removeClass(kind + '-glow');
}

CwicScheduleViewItem.prototype.relativeSlackPercentage = function(slackBegin, begin, slackEnd) {
  var totalWrapperTimeLength = slackEnd.diff(slackBegin);
  var relativeSlackPercentage = 0;
  if(!slackBegin.isSame(begin)) {
    // We need to show start slack here
    relativeSlackPercentage = (begin.diff(slackBegin) / totalWrapperTimeLength) * 100;
  }
  return relativeSlackPercentage;
};

CwicScheduleViewItem.prototype.relativeSlackWidthPercentage = function(slackBegin, begin, end, slackEnd) {
  var totalWrapperTimeLength = slackEnd.diff(slackBegin);
  var itemTimeLength = end.diff(begin);
  return itemTimeLength / totalWrapperTimeLength * 100;
};

CwicScheduleViewItem.prototype.renderPart = function(jschobj, momentBlock) {
  var newScheduleItemWrapper = this.schedule.getTemplateClone('scheduleItemTemplate');
  var newScheduleItem = newScheduleItemWrapper.find('div.schedule-item');

  this.setScheduleItemDimensions(newScheduleItemWrapper, momentBlock);

  this.addLayout(newScheduleItemWrapper, newScheduleItem);

  this.addStatusFlag(newScheduleItem);

  // Add scheduleItem ID to DOM object
  newScheduleItem.data('scheduleItemID', this.item_id);

  newScheduleItem.attr('title', this.description);
  newScheduleItem.find('p.item-text').text(this.description);

  jschobj.append(newScheduleItemWrapper);

  return newScheduleItemWrapper;
};

CwicScheduleViewItem.prototype.addStatusFlag = function(scheduleItemDOM) {
  if(this.status) {
    scheduleItemDOM.find('div.status').attr('title', this.status.name).css({ backgroundColor: this.status.bg_color, color: this.status.text_color, borderColor: this.status.text_color }).find('span').text(this.status.name.substring(0,1));
  } else {
    scheduleItemDOM.find('div.status').hide();
  }
};

CwicScheduleViewItem.prototype.addLayout = function(newScheduleItemWrapper, newScheduleItem) {
  if(this.focused) {
    newScheduleItemWrapper.addClass('focused');
  }
  if(!this.blocking) {
    newScheduleItemWrapper.addClass('hidden');
  }

  if(this.bg_color !== null) {
    newScheduleItem.css('background-color', this.bg_color);
    newScheduleItem.find('.continue').css('background-color', this.bg_color);
  } else {
    newScheduleItemWrapper.addClass('concept');
  }
  if(this.text_color !== null) {
    newScheduleItem.css('color', this.text_color);
    newScheduleItem.find('a').css('color', this.text_color);
  }
};

CwicScheduleViewItem.prototype.acceptConcept = function() {
  this.undoBegin = this.begin;
  this.undoEnd = this.end;

  this.begin = this.getConceptBegin();
  this.end = this.getConceptEnd();

  this.scheduleEntity.checkUnhideNonBlockingItems();

  this.deepRerender();
};

CwicScheduleViewItem.prototype.undoAcceptConcept = function() {
  if(this.undoBegin !== null) {
    this.begin = this.undoBegin;
  }
  if(this.undoEnd !== null) {
    this.end = this.undoEnd;
  }

  this.rerender();
};

CwicScheduleViewItem.prototype.destroy = function() {
  this.scheduleEntity.destroyScheduleItem(this.item_id);
};

CwicScheduleViewItem.prototype.resetConcept = function() {
  this.conceptBegin = null;
  this.conceptEnd = null;

  this.scheduleEntity.checkUnhideNonBlockingItems();

  this.rerender(); // Rerender in normal mode
};

CwicScheduleViewItem.prototype.moveConceptTo = function(newBeginMoment) {
  if(newBeginMoment.isSame(this.getConceptBegin())) {
    // Nothing changed, move on
    return;
  }

  // Keep the duration of the item
  var duration = this.getConceptEnd().diff(this.getConceptBegin());

  this.conceptBegin = moment(newBeginMoment);
  this.conceptEnd = moment(newBeginMoment).add('ms', duration);

  this.rerender(true); // Rerender as concept
};

CwicScheduleViewItem.prototype.applyTimeDiffConcept = function(milliseconds) {
  this.conceptBegin = moment(this.begin).add('ms', milliseconds);
  this.conceptEnd = moment(this.end).add('ms', milliseconds);
  this.rerender(true);
  return this.getDomObjects();
};

CwicScheduleViewItem.prototype.resizeConcept = function(side, newMoment) {
  if(side == 'backwards') {
    if(newMoment.isSame(this.getConceptBegin())) {
      // Nothing changed, move on
      return;
    }
    this.conceptBegin = moment(newMoment);
  } else {
    if(newMoment.isSame(this.getConceptEnd())) {
      // Nothing changed, move on
      return;
    }
    this.conceptEnd = moment(newMoment);
  }
  this.rerender(true);
};

CwicScheduleViewItem.prototype.conceptDiffersWithOriginal = function() {
  return !this.begin.isSame(this.getConceptBegin()) || !this.end.isSame(this.getConceptEnd());
};

CwicScheduleViewItem.prototype.checkEndAfterBegin = function(concept) {
  var currBegin, currEnd;
  if(concept) {
    currBegin = this.getConceptBegin();
    currEnd = this.getConceptEnd();
    return currBegin.isBefore(currEnd);
  } else {
    currBegin = this.begin;
    currEnd = this.end;
  }
  if(currBegin === null || currEnd === null) {
    return false;
  }
  return this.begin.isBefore(this.end);
};

CwicScheduleViewItem.prototype.getConceptBegin = function() {
  return moment((this.conceptBegin !== null) ? this.conceptBegin : this.begin);
};

CwicScheduleViewItem.prototype.getConceptEnd = function() {
  return moment((this.conceptEnd !== null) ? this.conceptEnd : this.end);
};

CwicScheduleViewItem.prototype.getConceptSlackBegin = function() {
  return moment(this.getConceptBegin()).subtract('minutes', this.slack_before);
};

CwicScheduleViewItem.prototype.getConceptSlackEnd = function() {
  return moment(this.getConceptEnd()).add('minutes', this.slack_after);
};

CwicScheduleViewItem.prototype.getSlackBegin = function() {
  return moment(this.begin).subtract('minutes', this.slack_before);
};

CwicScheduleViewItem.prototype.getSlackEnd = function() {
  return moment(this.end).add('minutes', this.slack_after);
};

// This function has to be extended to check collision with first events just out of the current calendar scope
CwicScheduleViewItem.prototype.conceptCollidesWithOthers = function(slack) {
  var _this = this;

  var curConceptBegin = slack ? this.getConceptSlackBegin() : this.getConceptBegin();
  var curConceptEnd = slack ? this.getConceptSlackEnd() : this.getConceptEnd();
  var otherItemsForObject = this.scheduleEntity.scheduleItems;
  var collision = false;

  if(otherItemsForObject !== null) {
    $.each(otherItemsForObject, function(itemId, item) {
      // exclude self
      if(_this.item_id !== null && itemId == _this.item_id) {
        return true;
      }

      var itemBegin = slack ? item.getSlackBegin() : item.begin;
      var itemEnd = slack ? item.getSlackEnd() : item.end;

      if((itemBegin.isBefore(curConceptEnd) || itemEnd.isBefore(curConceptBegin)) && curConceptBegin.isBefore(itemEnd)) {
        if(item.blocking) {
          collision = true;
          return false; // Break out of each loop
        } else {
          item.setVisibilityDom(false);
          return true;
        }
      }
    });
  }

  return collision;
};

CwicScheduleViewItem.prototype.conceptSlackCollidesWithOthers = function() {
  return this.conceptCollidesWithOthers(true);
};

CwicScheduleViewItem.prototype.conceptCollidesWith = function(moment) {
  var curConceptBegin = this.getConceptBegin();
  var curConceptEnd = this.getConceptEnd();

  return ((curConceptBegin.isBefore(moment) || curConceptBegin.isSame(moment)) && curConceptEnd.isAfter(moment));
};

CwicScheduleViewItem.prototype.removeFromDom = function() {
  $(this.getDomObjects()).remove();
  this.domObjects = {};
};

CwicScheduleViewItem.prototype.setVisibilityDom = function(visible) {
  this.hidden = !visible;
  (visible) ? $(this.getDomObjects()).show() : $(this.getDomObjects()).hide();
};

CwicScheduleViewItem.prototype.getDomObjects = function() {
  return APP.util.arrayValues(this.domObjects);
};

CwicScheduleViewItem.prototype.applyFocus = function() {
  this.focused = true;
  var domOs = $(this.getDomObjects());
  domOs.addClass('focused');
  domOs.find('.resizer.left').css('cursor', 'w-resize');
  domOs.find('.resizer.right').css('cursor', 'e-resize');

  this.schedule.blurStateOnOtherScheduleItems(true);
};

CwicScheduleViewItem.prototype.removeFocus = function() {
  this.focused = false;
  var domOs = $(this.getDomObjects());
  domOs.removeClass('focused');
  domOs.find('.resizer.left').css('cursor', 'auto');
  domOs.find('.resizer.right').css('cursor', 'auto');

  this.schedule.blurStateOnOtherScheduleItems(false);
};

CwicScheduleViewItem.prototype.rerender = function(concept) {
  this.render(concept);
};

CwicScheduleViewItem.prototype.deepRerender = function(concept) {
  this.removeFromDom();
  this.render(concept);
};

CwicScheduleViewItem.prototype.addResizers = function(schedulePartWrapper, back, forward) {
  if(this.schedule.options.view == 'horizontalCalendar') {
    back ? schedulePartWrapper.find('div.resizer.left').show() : schedulePartWrapper.find('div.resizer.left').hide();
    forward ? schedulePartWrapper.find('div.resizer.right').show() : schedulePartWrapper.find('div.resizer.right').hide();
  } else if (this.schedule.options.view == 'verticalCalendar') {
    back ? schedulePartWrapper.find('div.resizer.top').show() : schedulePartWrapper.find('div.resizer.top').hide();
    forward ? schedulePartWrapper.find('div.resizer.bottom').show() : schedulePartWrapper.find('div.resizer.bottom').hide();
  }
};

CwicScheduleViewItem.prototype.showContinues = function(schedulePartWrapper, back, forward) {
  if(this.schedule.options.view == 'horizontalCalendar') {
    back ? schedulePartWrapper.find('div.continue.left').show() : schedulePartWrapper.find('div.continue.left').hide();
    forward ? schedulePartWrapper.find('div.continue.right').show() : schedulePartWrapper.find('div.continue.right').hide();
  } else if (this.schedule.options.view == 'verticalCalendar') {
    back ? schedulePartWrapper.find('div.continue.top').show() : schedulePartWrapper.find('div.continue.top').hide();
    forward ? schedulePartWrapper.find('div.continue.bottom').show() : schedulePartWrapper.find('div.continue.bottom').hide();
  }
};

CwicScheduleViewItem.prototype.getMomentsBlock = function() {
  var currSlackBegin, currBegin, currEnd, currSlackEnd;
  if(this.conceptMode) {
    currBegin = this.getConceptBegin();
    currSlackBegin = this.getConceptSlackBegin();

    currEnd = this.getConceptEnd();
    currSlackEnd = this.getConceptSlackEnd();
  } else {
    currBegin = this.begin;
    currSlackBegin = this.getSlackBegin();

    currEnd = this.end;
    currSlackEnd = this.getSlackEnd();
  }

  return {
    slackBegin: currSlackBegin,
    begin: currBegin,
    end: currEnd,
    slackEnd: currSlackEnd
  };
};

CwicScheduleViewItem.prototype.setScheduleItemDimensions = function(domObj, momentBlock) {
  var domObjWrapper = $(domObj);
  var domObj = domObjWrapper.find('div.schedule-item');
  // The wrapper will have the full slack space as dimensions
  domObjWrapper.css(this.schedule.cssLeftOrTop(), this.schedule.timeToPercentage(momentBlock.slackBegin) + '%');
  domObjWrapper.css(this.schedule.cssWidthOrHeight(), this.schedule.timePercentageSpan(momentBlock.slackBegin, momentBlock.slackEnd) + '%');
  domObj.css(this.schedule.cssLeftOrTop(), this.relativeSlackPercentage(momentBlock.slackBegin, momentBlock.begin, momentBlock.slackEnd) + '%');
  domObj.css(this.schedule.cssWidthOrHeight(), this.relativeSlackWidthPercentage(momentBlock.slackBegin, momentBlock.begin, momentBlock.end, momentBlock.slackEnd) + '%');
};

CwicScheduleViewItem.prototype.render = function(concept) {
  var _this = this;
  this.conceptMode = concept || false;
  var momentBlock = this.getMomentsBlock();

  var domObjectsAlreadyPresent = APP.util.arrayKeys(this.domObjects);

  if(!this.checkEndAfterBegin(concept)) {
    // remove all items
    this.removeFromDom();
    return;
  }

  // Also accept an item that stops on 0:00 the following day
  var parts = (this.schedule.options.zoom == 'day') ? this.schedule.getDatesBetween(momentBlock.slackBegin, momentBlock.slackEnd) : this.schedule.getWeeksBetween(momentBlock.slackBegin, momentBlock.slackEnd);
  for(var parti in parts) {
    var part = parts[parti];
    var partBegin = moment(part).startOf(this.schedule.options.zoom);
    var partEnd = moment(part).endOf(this.schedule.options.zoom);

    // The momentJS min and max functions work like a lowerbound and upperboud limit function and not really like min and max
    var partMomentBlock = {
      slackBegin: momentBlock.slackBegin.min(partBegin),
      begin: momentBlock.begin.min(partBegin),
      end: momentBlock.end.max(partEnd),
      slackEnd: momentBlock.slackEnd.max(partEnd)
    };

    var partBeginContainerId = this.schedule.getContainerId(partBegin);

    var schedulePartWrapper;

    if($.inArray(partBeginContainerId, domObjectsAlreadyPresent) > -1) {
      // Dom object already exists for this container! lets make use of it
      schedulePartWrapper = $(this.domObjects[partBeginContainerId]);
      this.setScheduleItemDimensions(schedulePartWrapper, partMomentBlock);

      // Remove this item from the array of existing dom objects that are not used.
      domObjectsAlreadyPresent = $.grep(domObjectsAlreadyPresent, function(value) {
        return value != partBeginContainerId;
      });
    } else {
      var container = this.schedule.getZoomContainer(part, this.scheduleEntity.entity_id);

      // Check if the container is not present, this means not in current view, so skip
      if(container.length === 0) {
        continue;
      }

      schedulePartWrapper = this.renderPart(container, partMomentBlock);
      this.domObjects[partBeginContainerId] = schedulePartWrapper.get(0);
    }

    if(momentBlock.begin.isAfter(partBegin) && momentBlock.begin.isBefore(partEnd) && momentBlock.end.isAfter(partBegin) && momentBlock.end.isBefore(partEnd)) {
      this.addResizers(schedulePartWrapper, true, true);
    } else if(momentBlock.begin.isAfter(partBegin) && momentBlock.begin.isBefore(partEnd)) {
      // ScheduleItem begin is in current part
      this.showContinues(schedulePartWrapper, false, true);
      this.addResizers(schedulePartWrapper, true, false);
    } else if(momentBlock.end.isAfter(partBegin) && momentBlock.end.isBefore(partEnd)) {
      // ScheduleItem end is in current part
      this.showContinues(schedulePartWrapper, true, false);
      this.addResizers(schedulePartWrapper, false, true);
    } else {
      // All overlapped parts
      this.showContinues(schedulePartWrapper, true, true);
    }
  }

  this.checkGlowState();

  // Lets see if we still need to delete unused DOM objects from the previous render
  $(domObjectsAlreadyPresent).each(function(index, value) {
    $(_this.domObjects[value]).remove();
    delete _this.domObjects[value];
  });
};

CwicScheduleViewItem.prototype.bindDragAndResizeControls = function() {
  var _this = this;
  var context = {
    reset: function() {
      this.side = null;
      this.pointerDown = false;
      this.container = null;
      this.dragStartMoment = null;
      this.lastDragMoment = null;
      return this;
    }
  }.reset();

  var scheduleBody = this.schedule.scheduleContainer.find('div.schedule-body');
  scheduleBody.on('movestart.dragresize', 'div.schedule-item-wrapper.focused div.schedule-item', function(e) { _this.dragAndResizeDown(e, context); });
  scheduleBody.on('move.dragresize', function(e) { _this.dragAndResizeMove(e, context); });
  scheduleBody.on('moveend.dragresize', function(e) { _this.dragAndResizeUp(e, context); });
  $(document).on('keyup.cancelDragOrResize', function(e) { _this.dragAndResizeEsc(e, context);});
};

CwicScheduleViewItem.prototype.unbindDragAndResizeControls = function() {
  var scheduleBody = this.schedule.scheduleContainer.find('div.schedule-body');
  scheduleBody.off('movestart.dragresize');
  scheduleBody.off('move.dragresize');
  scheduleBody.off('moveend.dragresize');
  $(document).off('keyup.cancelDragOrResize');
};


CwicScheduleViewItem.prototype.dragAndResizeEsc = function(event, context) {
  if (event.keyCode == 27) {
    if(this.conceptDiffersWithOriginal()) {
      this.resetConcept();
      context.reset();
    } else {
      this.schedule.stopEditMode();
    }
  }
};

CwicScheduleViewItem.prototype.dragAndResizeDown = function(event, context) {
  console.debug(event.type);
  context.pointerDown = true;
  var scheduleItemDOM = $(event.target);
  context.container = scheduleItemDOM.closest('div.schedule-object-item-parts');
  // Check if drag started on resize handle
  var handle = $(event.target).closest('div.resizer');
  if(handle.length !== 0) { // resize mode
    context.side = (handle.hasClass('left') || handle.hasClass('top') ? 'backwards' : 'forwards');
  } else { // drag mode
    var rel = this.schedule.getPointerRel(event, context.container);
    context.dragStartMoment = this.schedule.nearestMomentPoint(rel, context.container);
    context.lastDragMoment = context.dragStartMoment;
  }
};

CwicScheduleViewItem.prototype.dragAndResizeMove = function(event, context) {
  console.debug(event.type);
  if(context.pointerDown) {
    // Get the something we clicked on
    var scheduleItemClickedDom = $(event.target);

    // Are we in a different row or column?
    var newRow = scheduleItemClickedDom.closest('div.schedule-object-item-parts');
    if(newRow.length > 0) {
      context.container = newRow;
    }

    var rel = this.schedule.getPointerRel(event, context.container);
    var newMoment = this.schedule.nearestMomentPoint(rel, context.container);
    if(context.side === null) { // drag item mode
      // correct position in schedule-item, because we want to know the begin position of this item.
      // rel can be negative if item is dragged to previous day.
      if(!newMoment.isSame(context.lastDragMoment)) {
        var dragMomentDiffMS = moment(newMoment).diff(context.dragStartMoment);
        var newDoms = this.applyTimeDiffConcept(dragMomentDiffMS);
        context.lastDragMoment = newMoment;
      }
    } else { // resize mode
      this.resizeConcept(context.side, newMoment);
    }
  }
};

CwicScheduleViewItem.prototype.checkGlowState = function() {
  var errorGlow = this.conceptCollidesWithOthers();
  var slackGlow = this.conceptSlackCollidesWithOthers() && ! errorGlow;
  this.applyGlow('slack', slackGlow);
  this.applyGlow('error', errorGlow);
};

CwicScheduleViewItem.prototype.dragAndResizeUp = function(event, context) {
  console.debug(event.type);
  context.pointerDown = false;
  if(this.conceptCollidesWithOthers() || !this.checkEndAfterBegin(true)) {
    this.resetConcept();
  }
  // Reset drag vars
  context.reset();
};

CwicScheduleViewItem.prototype.dragAndResizeCancel = function(event, context) {
  context.pointerDown = false;
  this.resetConcept();
  context.reset();
};
