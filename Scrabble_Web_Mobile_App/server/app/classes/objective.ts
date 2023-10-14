export class Objective {
    points: number;
    objectiveName: string;
    objectiveStatus: string; // failed, completed, uncompleted
    objectiveId: number;
    playerId: string;
    failedFor: string[];
    completedBy: string;

    constructor(points: number, objectiveName: string, objectiveStatus: string, objectiveId: number) {
        this.points = points;
        this.objectiveName = objectiveName;
        this.objectiveStatus = objectiveStatus;
        this.objectiveId = objectiveId;
        this.playerId = '';
        this.failedFor = [];
        this.completedBy = '';
    }
}
