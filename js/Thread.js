/**
 *主线程，启动各个线程
 *
 */
function mainThread() {
    init();
    renderId = setInterval(renderThread, 20);                           //启动渲染线程
}


mainThread();