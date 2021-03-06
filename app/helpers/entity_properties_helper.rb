module EntityPropertiesHelper
  def render_entity_property_field(f)
    case f.object.property_type.data_type.form_type
    when 'collection_select'
      f.collection_select(:value, f.object.property_type.options, :id, :name, { title: format_description_with_name_title(f.object.property_type), (f.object.property_type.required? ? :prompt : :include_blank) => true })
    when 'collection_select_multi'
      f.collection_select(:value_ids, f.object.property_type.options, :id, :name, { title: format_description_with_name_title(f.object.property_type) }, { multiple: true })
    else
      f.send(f.object.property_type.data_type.form_type.to_sym, :value, title: format_description_with_name_title(f.object.property_type), value: f.object.formatted_value)
    end
  end
end
