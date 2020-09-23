import {Observable,Subject}from 'rxjs';

export class EventNotifier{
    private static instance: EventNotifier;

    private constructor(){}

    static getInstance(){
        if(EventNotifier.instance==null){
            EventNotifier.instance=new EventNotifier()
        }
        return EventNotifier.instance
    }

    private subject=new Subject<any>();

    sendMessage(data:any){
        this.subject.next(data)

    }
    getSubject():Subject<any>{
       return this.subject
    }
}