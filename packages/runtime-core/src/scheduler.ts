
const queue:any = [];
let isFlushing = false;
const resolvePromise = Promise.resolve();

export const queueJob = (job:any) => {
    if(!queue.includes(job)){
        queue.push(job);
    }
    if(!isFlushing){
        resolvePromise.then(() => {
            isFlushing = true;
            resolvePromise.then(() => {
                isFlushing = false;
                queue.shift();
                queue.forEach((job:any) => {
                    job();
                })
            
            })
        })
    }
}