#encoding: utf-8

class CatalogueController < ApplicationController
  protect_from_forgery with: :exception

  def index
    @css_class_layout = 'bm-layout-page-catalogue m-fullwidth'
    @scripts_id       = 'catalogue-index'

    @items = Item.all
    @items_groups_for_featured = [
      {
        header: t('catalogue.group.popular.header'),
        items: Item.last(4)
      },
      {
        header: t('catalogue.group.experiments.header'),
        items: Item.last(3)
      },
      {
        header: t('catalogue.group.best_of_aroma.header'),
        items: Item.last(3)
      },
      {
        header: t('catalogue.group.decaf.header'),
        items: Item.last(2)
      }
    ]

    render 'index_2'#, layout: 'empty'
  end
end
