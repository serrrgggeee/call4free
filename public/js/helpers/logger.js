function logger(type, message, value, logging=false) {
    if(logging) {
        socket.emit('logging', type, message, value);
    }
}