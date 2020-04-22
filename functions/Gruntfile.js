module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    apidoc: {
      myapp: {
        src: 'controller/',
        // for sports-apidoc
        dest: '../../sports-apidoc/'
        // for localhost test
        // dest: '../public/apidoc/'
      }
    }
  });

  grunt.loadNpmTasks('grunt-apidoc');

  // Default task(s).
  grunt.registerTask('default', ['apidoc']);
};
