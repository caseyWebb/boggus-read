/* eslint-disable no-console */

const { spawn } = require('child_process')
const chalk = require('chalk')
const { isEmpty } = require('lodash')
const gscan = require('gscan')
const logger = require('gulplog')
const gulp = require('gulp')
const clean = require('gulp-clean')
const crass = require('gulp-crass')
const uglify = require('gulp-uglify/composer')(require('uglify-es'), console)
const zip = require('gulp-zip')
const webpack = require('webpack-stream')
const named = require('vinyl-named')

const src = (x) => './src/' + x
const dest = (x) => './content/themes/casper/' + x

let watch

const paths = {
  dist: ['content/themes/casper', 'boggus-read.zip'],
  css: {
    src: src('css/*.css'),
    dest: dest('assets/css/')
  },
  images: {
    src: src('images/*'),
    dest: dest('assets/images/')
  },
  js: {
    src: src('js/*'),
    dest: dest('assets/js/')
  },
  templates: {
    src: src('templates/**'),
    dest: dest('')
  },
  zip: {
    src: dest('**'),
    dest: 'boggus-read.zip'
  }
}

gulp.task('clean', () => gulp.src(paths.dist, { read: false, allowEmpty: true })
  .pipe(clean()))

gulp.task('css', () => gulp.src(paths.css.src)
  .pipe(crass({ pretty: false }))
  .pipe(gulp.dest(paths.css.dest)))

gulp.task('images', () => gulp.src(paths.images.src, { buffer: false, since: gulp.lastRun('images') })
  .pipe(gulp.dest(paths.images.dest)))

gulp.task('js', (done) => {
  const stream = gulp.src(paths.js.src)
    .pipe(named())
    .pipe(webpack({
      output: {
        publicPath: '/assets/js/'
      },
      watch
    }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.js.dest))
  if (watch) {
    done()
  } else {
    return stream
  }
})

gulp.task('templates', () => gulp.src(paths.templates.src, { buffer: false, since: gulp.lastRun('templates') })
  .pipe(gulp.dest(paths.templates.dest)))

gulp.task('package.json', () => gulp.src('./package.json', { buffer: false })
  .pipe(gulp.dest('./content/themes/casper/')))

gulp.task('zip', () => gulp.src(paths.zip.src, { buffer: false })
  .pipe(zip(paths.zip.dest))
  .pipe(gulp.dest('./')))

gulp.task('validate', validate)

gulp.task('default',
  gulp.series(
    'clean',
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

let backendProc
function startBackend(done) {
  const prefix = `[${chalk.dim('BACKEND')}]`
  backendProc = spawn('docker', ['start', '-a', 'boggus-read-backend'])
  backendProc.stdout.on('data', (data) => {
    logger.info(prefix, data.toString().trim().replace(/^\[[\d\s\W]+\]\s+/, ''))
  })
  backendProc.stderr.on('data', (data) => {
    logger.error(prefix, data.toString().trim().replace(/^\[[\d\s\W]+\]\s+/, ''))
  })
  backendProc.on('close', () => {
    logger.info(prefix, chalk.yellow('Container stopped... Restarting...'))
    startBackend()
  })
  if (done) {
    done()
  }
}
gulp.task('backend:start', (done) => startBackend(done))
gulp.task('backend:restart', (done) => {
  backendProc.kill()
  done()
})

gulp.task('watch', () => {
  gulp.watch(paths.css.src, gulp.series('css'))
  gulp.watch(paths.images.src, gulp.series('images'))
  gulp.watch(paths.templates.src, gulp.series('templates', 'backend:restart'))
  gulp.watch(paths.zip.src, gulp.series('zip'))
  gulp.watch(paths.zip.dest, gulp.series('validate'))
})

gulp.task('develop',
  gulp.series(
    (done) => {
      watch = true
      done()
    },
    'default',
    gulp.parallel(
      'backend:start',
      'watch'
    )
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
    recommendation
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