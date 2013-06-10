class CreateEntityTypes < ActiveRecord::Migration
  def change
    create_table :entity_types do |t|
      t.string :name
      t.text :description

      t.timestamps
    end
  end
end
