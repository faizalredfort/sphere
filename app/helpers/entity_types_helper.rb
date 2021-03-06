module EntityTypesHelper
  def destroy_confirm(entity_type)
    t('entity_types.still_used_destroy_confirm', name: entity_type.name, count: entity_type.entities.size) if entity_type.entities.size > 0
  end

  def entity_type_audit_format(attr_name, value)
    case attr_name
    when 'min_reservation_length', 'max_reservation_length'
      (value.nil? ?  t('none') : "#{value} #{t('minutes_abbr').lcfirst}")
    when 'slack_before', 'slack_after'
      (value.nil? ?  t('default') : "#{value} #{t('minutes_abbr').lcfirst}")
    else
      generic_format(value)
    end
  end
end
