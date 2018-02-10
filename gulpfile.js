'use strict'

const { isEmpty } = require('lodash')
const chalk = require('chalk')
const mkdirp = require('mkdirp')
const gscan = require('gscan')
const gulp = require('gulp')
const copy = require('gulp-copy')
const crass = require('gulp-crass')
const uglify = require('gulp-uglify')
const zip = require('gulp-zip')

gulp.task('mkdir', (done) => mkdirp('./content/themes/casper', done))

gulp.task('css', () => gulp.src('./src/css/*.css')
  .pipe(crass({ pretty: false }))
  .pipe(gulp.dest('./content/themes/casper/assets/css/')))

gulp.task('images', () => gulp.src('./src/images/*', { buffer: false })
  .pipe(gulp.dest('./content/themes/casper/assets/images/')))

gulp.task('js', () => gulp.src('./src/js/*')
  .pipe(uglify())
  .pipe(gulp.dest('./content/themes/casper/assets/js/')))

gulp.task('templates', () => gulp.src('./src/templates/**', { buffer: false })
  .pipe(gulp.dest('./content/themes/casper/')))

gulp.task('package.json', () => gulp.src('./package.json', { buffer: false })
  .pipe(gulp.dest('./content/themes/casper/')))

gulp.task('zip', () => gulp.src('./content/themes/casper/**', { buffer: false })
  .pipe(zip('boggus-read.zip'))
  .pipe(gulp.dest('./')))

gulp.task('validate', validate)

gulp.task('default',
  gulp.series(
    'mkdir',
    gulp.parallel(
      'css',
      'images',
      'js',
      'templates',
      'package.json'
    ),
    'zip',
    'validate'
  )
)

async function validate() {
  const levels = {
    error: chalk.red,
    warning: chalk.yellow,
    recommendation: chalk.yellow,
    pass: chalk.green
  }

  const outputResult = (result) => console.log('-', levels[result.level](result.level), result.rule)

  const { results: {
    error,
    warning,
    recommendation,
    pass
  } } = gscan.format(
    await gscan.checkZip({
      path: './boggus-read.zip',
      name: 'boggus-read'
    })
  )
  
  const hasError = !isEmpty(error)
  const hasWarning = !isEmpty(warning)
  const hasRecommendation = !isEmpty(recommendation)

  if (hasError || hasWarning || hasRecommendation) {
    // hack to make this show up after gulp output
    process.nextTick(() => {
      if (!isEmpty(error)) {
        console.log(levels.error.bold.underline('\n! Must fix:'))
        error.forEach(outputResult)
      }

      if (!isEmpty(warning)) {
        console.log(levels.warning.bold.underline('\n! Should fix:'))
        warning.forEach(outputResult)
      }

      if (!isEmpty(recommendation)) {
        console.log(levels.recommendation.bold.underline('\n? Consider fixing:'))
        recommendation.forEach(outputResult)
      }

      console.log('')
    })
  }
}