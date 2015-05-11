class AddSpecsToItems < ActiveRecord::Migration
  def self.up
    add_column :items, :specs, :string
  end

  def self.down
    remove_column :items, :specs
  end
end
