// Modules 호출
const gulp = require('gulp'); // Gulp 모듈 호출
// gulp 플러그인 호출
const concat = require('gulp-concat'); // concat 플러그인 호출
const uglify = require('gulp-uglify'); // uglify 플러그인 호출
const rename = require('gulp-rename'); // rename 플러그인 호출
const sourcemaps = require('gulp-sourcemaps'); // sourcemaps 호출
const scss = require("gulp-sass")(require('sass')); // sass 호출
const browserSync = require('browser-sync').create(); // browser-sync 호출
const fileinclude = require('gulp-file-include'); // gulp-file-include 호출
const markdown = require('markdown'); // markdown 호출

// Path 정의
const src = 'src';
const dist = 'dist';
const paths = {
    js : src + '/js/**/*.js',
    scss : src + '/scss/*.scss',
    html : src + '/html/*.html'
};


// ========== @task : HTML ==========
gulp.task('html', function() {
    return gulp
        .src(paths.html) // html 파일을 읽어오기 위해 경로 지정
        .pipe(gulp.dest(dist + '/html'))
        .pipe(browserSync.stream()); // HTML 파일을 browserSync 로 브라우저에 반영
});


/*
    ========== @task : JavaScript 병합,압축,min 파일 생성 ==========
    Gulp.task()를 사용해 gulp-concat 업무 수행을 정의
    task 의 이름은 가능하면 플러그인과 연관성있는 이름을 정의하는 것이 좋습니다.
    여기서는 combine-js 라고 task 이름을 정의함.
*/
gulp.task('js:combine', function () {
    return gulp.src(paths.js) // js 하위 디렉터리 내의 모든 자바스크립트 파일을 가져온다.
        .pipe(concat('combined.js')) // 상단에서 참조한 concat 모듈을 호출하고 병합할 파일네이밍을 정의
        .pipe(gulp.dest(dist + '/js')) // 위에서 수행한 task 를 배포지(dist)에 파일을 생성한다.
        .pipe(uglify()) // 파일을 병합한 후 uglifiy를 수행한다.
        .pipe(rename({suffix : ".min"})) // min 네이밍으로 파일 생성
        .pipe(gulp.dest('dist/js')) // pipe 에 concat, uglify 을 수행한 후 rename 실행
        .pipe(browserSync.stream()); // 스크립트 파일을 browserSync 로 브라우저에 반영
});


// ========== SCSS config(환경설정) ==========
const scssOptions = {
    /*
        * CSS의 컴파일 결과 코드스타일 지정
        * Values : nested, expanded, compact, compressed
    */
    outputStyle : "expanded",

    /*
        * 컴파일 된 CSS의 "들여쓰기" 의 타입
        * Values : space, tab
    */
    indentType : "tab",

    /*
        * 컴파일 된 CSS의 "들여쓰기" 의 갯수
        * outputStyle 이 nested, expanded 인 경우에 사용
    */
    indentWidth : 1,
    precision: 6, // 컴파일 된 CSS 의 소수점 자리수
    sourceComments: false // 컴파일 된 CSS 에 원본소스의 위치와 줄수 주석표시
}


// ========== @task : SCSS Compile & sourcemaps ==========
gulp.task('scss:compile', function() {
    return gulp
        .src(paths.scss) // SCSS 파일을 읽어온다.
        .pipe(sourcemaps.init()) // 소스맵초기화(소스맵을 생성)
        .pipe(scss(scssOptions).on('error', scss.logError)) // SCSS 함수에 옵션값을 설정, SCSS작성시 watch가 멈추지 않도록 logError를 설정
        .pipe(sourcemaps.write()) // 위에서 생성한 소스맵을 사용한다.
        .pipe(gulp.dest(dist + '/css')) // 목적지(dist)를 설정
        .pipe(browserSync.stream()); // SCSS 컴파일을 수행한 후 browserSync 로 브라우저에 반영
});

gulp.task('fileinclude', function() {
    return gulp.src([
        "src/html/*", // 불러올 파일의 위치
        "!" + "src/html/include/*" // 읽지 않고 패스할 파일의 위치
    ])
    .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file',
        filters: {
            markdown: markdown.parse
        }
    }))
    .pipe(gulp.dest('dist/html')); // 변환한 파일의 저장 위치 지정
});

// ========== @task : browserSync ==========
gulp.task('browserSync', function() {
    return browserSync.init({
        port : 3333, 
        server : {
            baseDir : 'dist/',
            directory: true
        }
    }),
    gulp.watch("src/*").on("change", browserSync.reload)
});


// ========== @task : 지속적인 업무 관찰을 위해 watch 등록 (파일 변경을 감지한다.) ==========
gulp.task('watch', function() {
    gulp.watch(paths.html, gulp.series(['html'])); // html task 를 watch 에 등록
    gulp.watch(paths.js, gulp.series(['js:combine']));
    gulp.watch(paths.scss, gulp.series(['scss:compile']));
});

// gulp 를 실행하면 default 로 js:combine task, scss:compile task 그리고 watch task 를 실행하도록 한다.
gulp.task('default', gulp.parallel(['html','js:combine','scss:compile','fileinclude','browserSync','watch']));