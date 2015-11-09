#encoding: utf-8

class Item < ActiveRecord::Base
  include ApplicationHelper
  after_initialize :init

  has_attached_file :image, :styles => { :large => "500x700>", :medium => "300x500>" }
  has_attached_file :image_plantation, :styles => { :default => "600x400>" }
  validates_attachment_content_type :image, :content_type => /\Aimage\/.*\Z/
  validates_attachment_content_type :image_plantation, :content_type => /\Aimage\/.*\Z/

  has_many :order_items

  def init
    self.rating       ||= 5.0
    self.methods      ||= [:french, :turk, :cup, :machine, :aeropress, :v60, :moka, :siphon]
    self.specs        ||= {
      acidity:    0,
      aroma:      0,
      body:       0,
      aftertaste: 0
    }.to_json
  end

  def specs_as_hash
    JSON.parse(self.specs.gsub(/:([a-zA-z]+)/,'"\\1"').gsub('=>', ': ')).symbolize_keys
  end

  def specs_with_labels
    specs = self.specs_as_hash
    ret = [
      {
        name:  :acidity,
        label: "кислинка",
        description: "В&nbsp;кофейном зерне содержится более 30&nbsp;натуральных кислот. Вкус кофе зависит от&nbsp;их&nbsp;набора и&nbsp;количества. О&nbsp;кофе принято судить именно по&nbsp;кислинке",
        value: specs[:acidity]
      },
      {
        name:  :aroma,
        label: "аромат",
        description: "Кофейный аромат&nbsp;&mdash; это смесь сотен летучих соединений, которые образовались в&nbsp;процессе обжарки. Чем меньше дней прошло с&nbsp;обжарки, тем больше ароматов он&nbsp;сохраняет",
        value: specs[:aroma]
      },
      {
        name:  :body,
        label: "тело",
        description: "Чем больше в&nbsp;кофе танинов, органических веществ, тем более выражена кофейная горчинка. Горечь можно уменьшить молоком или сливками",
        value: specs[:body]
      },
      {
        name:  :aftertaste,
        label: "послевкусие",
        description: "Кофейное послевкусие представляет собой сложный букет вкусов, улавливаемых обонятельными органами после каждого глотка кофе",
        value: specs[:aftertaste]
      }
    ]
    ret
  end

  def description_short
    desc = if self.kind == "mono"
      "Моносорт, 100% арабика"
    elsif self.kind == "aroma"
      "Ароматизированный кофе, 100% арабика"
    elsif self.kind == "exotic"
      "Экзотический сорт, 100% арабика"
    elsif self.kind == "espresso"
      "Смесь для кофемашин"
    end
  end

  def get_price_250
    self.price
  end

  def get_price_500
    self.price_500.present? ? self.price_500 : self.price * 2
  end

  def get_price_1000
    self.price_1000.present? ? self.price_1000 : self.price * 4
  end

  def methods_with_labels
    ret = []
    methods = self.methods.split(' ')

    methods.each do |name|
      ret.push brewing_method_meta(name.to_sym)
    end

    ret
  end

  def api_attributes
    rtn = {
      id:                self.id,
      name:              self.name,
      methods:           self.methods,
      methodsWithLabels: self.methods_with_labels,
      price:             [
        {
          amount: 250,
          value:  self.get_price_250
        }, {
          amount: 500,
          value:  self.get_price_500
        }, {
          amount: 1000,
          value:  self.get_price_1000
        }
      ],
      isPublished:       self.is_published,
      url:               self.url,
      rating:            self.rating,
      description:       self.description,
      descriptionShort:  self.description_short,
      kind:              self.kind,
      specs:             self.specs_as_hash,
      specsWithLabels:   self.specs_with_labels,
      image: {
        medium:   self.image.url(:medium),
        large:    self.image.url(:large),
        original: self.image.url(:original)
      },
      imagePlantation: {
        default: self.image_plantation.url(:default)
      }
    }
    rtn
  end

end
