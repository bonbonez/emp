class CreateItems < ActiveRecord::Migration
  def change
    create_table :items do |t|
      t.string :name
      t.string :methods
      t.integer :price
      t.boolean :is_published
      t.string :url
      t.float :rating
      t.text :description

      t.timestamps null: false
    end
  end
end
