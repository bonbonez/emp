#encoding: utf-8

module ApplicationHelper

  def frontend_version
    @frontend_version ||= begin
      frontend_version_file = YAML.load_file(File.join(Rails.root, "config/frontend_version.yml"))
      frontend_version_file["version"]
    end
  end

  def brewing_methods(options = {})

    @brewing_methods ||= [
      {
        name: :french,
        label: I18n.t('brewing_method.french.label'),
        grind: grind_meta(:coarse)
      },
      {
        name: :turk,
        label: I18n.t('brewing_method.turk.label'),
        grind: grind_meta(:extrafine)
      },
      {
        name: :cup,
        label: I18n.t('brewing_method.cup.label'),
        grind: grind_meta(:extrafine)
      },
      {
        name: :manual_espresso,
        label: I18n.t('brewing_method.manual_espresso.label'),
        grind: grind_meta(:extrafine)
      },
      {
        name: :machine,
        label: I18n.t('brewing_method.machine.label'),
        grind: grind_meta(:beans)
      },
      {
        name: :aeropress,
        label: I18n.t('brewing_method.aeropress.label'),
        grind: grind_meta(:medium)
      },
      {
        name: :v60,
        label: I18n.t('brewing_method.v60.label'),
        grind: grind_meta(:medium)
      },
      {
        name: :moka,
        label: I18n.t('brewing_method.moka.label'),
        grind: grind_meta(:fine)
      },
      {
        name: :siphon,
        label: I18n.t('brewing_method.siphon.label'),
        grind: grind_meta(:coarse)
      }
    ]

    ret = @brewing_methods

    if options[:with_beans] == true
      ret.unshift({
        name: :beans,
        label: I18n.t('grind.no_grind.label'),
        grind: grind_meta(:beans)
      })
    end

    if options[:sort_by].present?
      if options[:sort_by] == :grind_index_asc
        ret = ret.sort{|a, b| a[:grind][:index] > b[:grind][:index] ? 1 : -1}
      elsif options[:sort_by] == :grind_index_desc
        ret = ret.sort{|a, b| a[:grind][:index] > b[:grind][:index] ? -1 : 1}
      end
    end

    ret
  end

  def brewing_method_meta(kind)
    brewing_methods.find{|m|m[:name] == kind}
  end

  def grind_types
    ret = [
      grind_meta(:extrafine),
      grind_meta(:fine),
      grind_meta(:medium),
      grind_meta(:coarse),
      grind_meta(:beans)
    ]
    ret
  end

  def grind_meta(kind)
    ret = {}
    if kind == :extrafine
      ret = {
        kind: kind,
        label: "Ульра",
        label_full: "Ультрапомол",
        label_full_form1: "Ультрапомол",
        image: {
          url: "/images/grinds/extrafine.png"
        },
        index: 4
      }
    elsif kind == :fine
      ret = {
        kind: kind,
        label: "Тонкий",
        label_full: "Тонкий помол",
        label_full_form1: "Тонкого помола",
        image: {
          url: "/images/grinds/fine.png"
        },
        index: 3
      }
    elsif kind == :medium
      ret = {
        kind: kind,
        label: "Средний",
        label_full: "Средний помол",
        label_full_form1: "Среднего помола",
        image: {
          url: "/images/grinds/medium.png"
        },
        index: 2
      }
    elsif kind == :coarse
      ret = {
        kind: kind,
        label: "Грубый",
        label_full: "Грубый помол",
        label_full_form1: "Грубого помола",
        image: {
          url: "/images/grinds/coarse.png"
        },
        index: 1
      }
    elsif kind == :beans
      ret = {
        kind: kind,
        label: "В зерне",
        label_full: "В зерне",
        label_full_form1: "В Зерне",
        image: {
          url: "/images/grinds/beans.png"
        },
        index: 0
      }
      ret
    end

    ret
  end

  def get_frontend_config
    show_header_order = params[:controller] != 'order'

    config = {
      show_header_order: show_header_order
    }
    config
  end

end
