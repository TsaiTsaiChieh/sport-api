module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    apidoc: {
      myapp: {
        src: "controller/",
        dest: "../public/apidoc/"
      }
    }
  });

  grunt.loadNpmTasks('grunt-apidoc');

  // Default task(s).
  grunt.registerTask('default', ['apidoc']);

};