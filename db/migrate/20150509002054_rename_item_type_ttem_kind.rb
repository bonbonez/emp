class RenameItemTypeTtemKind < ActiveRecord::Migration
  def self.up
    rename_column :items, :type, :kind
  end

  def self.down
    rename_column :items, :kind, :type
  end
end
