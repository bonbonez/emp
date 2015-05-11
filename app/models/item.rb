class Item < ActiveRecord::Base
  after_initialize :init

  has_attached_file :image, :styles => { :large => "500x700>", :medium => "300x500>" }
  has_attached_file :image_plantation, :styles => { :default => "600x400>" }
  validates_attachment_content_type :image, :content_type => /\Aimage\/.*\Z/
  validates_attachment_content_type :image_plantation, :content_type => /\Aimage\/.*\Z/

  def init
    self.rating       ||= 5.0
    self.methods      ||= [:french, :turk, :cup, :machine, :aeropress, :v60, :moka, :siphon]
    self.specs        ||= {
      acidity:    0,
      aroma:      0,
      body:       0,
      aftertaste: 0
    }
  end

  def api_attributes
    rtn = {
      name:         self.name,
      methods:      self.methods,
      price:        self.price,
      is_published: self.is_published,
      url:          self.url,
      rating:       self.rating,
      description:  self.description,
      created_at:   self.created_at,
      kind:         self.kind,
      specs:        self.specs,
      image: {
        medium: self.image.url(:medium),
        large:  self.image.url(:lage)
      }
    };
  end

end
