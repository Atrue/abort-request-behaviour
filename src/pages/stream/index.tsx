import React from 'react';

export default function StreamPage() {
    return (
        <div>
            <video src="/api/stream/video" width="320" height="190" controls></video>

            <video src="/api/stream/proxy2/2010/05/sintel/trailer.mp4#t=50" width="320" height="190" controls></video>
        </div>
    )
}