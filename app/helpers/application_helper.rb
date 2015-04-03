module ApplicationHelper

  def frontend_version
    @frontend_version ||= begin
      frontend_version_file = YAML.load_file(File.join(Rails.root, "config/frontend_version.yml"))
      frontend_version_file["version"]
    end
  end

end
