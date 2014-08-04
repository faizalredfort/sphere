module ApplicationHelper
  def resource_name
    :user
  end
 
  def resource
    @resource ||= User.new
  end
 
  def devise_mapping
    @devise_mapping ||= Devise.mappings[:user]
  end

  def format_bool(bool)
    I18n.t(bool.to_s)
  end

  def format_text(text)
    text.present? ? text : I18n.t('none_html').html_safe
  end

  # Format description (title) helpers. Useful for (a.o.) entities and entity types.
  def format_description_title(obj)
    obj = obj.description if obj.respond_to?(:description)
    obj = obj.gsub(/\s/i, ' ')
    obj.truncate(200, separator: ' ')
  end

  def format_description_with_name_title(obj)
     if obj.description.present?
      "#{obj.name} (#{format_description_title(obj)})"
    else
      "#{obj.name}"
    end
  end

  def format_description(obj)
    obj = obj.description if obj.respond_to?(:description)
    obj = obj.gsub(/\s/i, ' ')
    content_tag(:span, obj.truncate(100, separator: ' '), title: format_description_title(obj))
  end

  def format_help(text, type = :block)
    text = format_text(text)
    content_tag((type == :inline ? :span : :div), content_tag(:i, '', class: 'icon-info-sign', title: text), class: 'help')
  end
  
  def format_address(route, street_number, postal_code, administrative_area_level_2, administrative_area_level_1, locality, country)
    address = escape_once(route) + ' ' + escape_once(street_number) + tag('br') + escape_once(postal_code) + '&nbsp; ' + escape_once(locality).upcase + tag('br') + escape_once(country)
    return address.html_safe
  end
end
