class Country < ActiveRecord::Base
  has_attached_file :flag, :styles => { :thumb => "200x200>" }
  validates_attachment_content_type :flag, :content_type => /\Aimage\/.*\Z/
end
