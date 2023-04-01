// eslint-disable-next-line import/no-extraneous-dependencies
const {mergeContents} = require('@expo/config-plugins/build/utils/generateCode');
const {withDangerousMod} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function fixDeploymentTarget(src) {
  return mergeContents({
    tag: `withXcode143Workaround`,
    src,
    newSrc: `    #   Workaround for build errors that occur with Xcode 14.3.
    #   See https://github.com/facebook/react-native/issues/36635
    installer.pods_project.targets.each do |target|
      if ['React-Codegen'].include? target.name
        target.build_configurations.each do |config|
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = podfile_properties['ios.deploymentTarget'] || '13.0'
        end
      end
    end`,
    anchor: /post_install\s+do\s*\|.+\|/,
    offset: 1,
    comment: '    #',
  }).contents;
}

const withXcode143Workaround = config => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      const contents = await fs.promises.readFile(file, 'utf8');
      await fs.promises.writeFile(file, fixDeploymentTarget(contents), 'utf8');
      return config;
    },
  ]);
};

module.exports = withXcode143Workaround;
