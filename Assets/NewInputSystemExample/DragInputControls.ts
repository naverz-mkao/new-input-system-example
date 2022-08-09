import { Camera, Coroutine, Debug, GameObject, Object, Physics, Plane, RaycastHit, Time, Vector2, Vector3, WaitForSeconds } from 'UnityEngine';
import { PlayerInput } from 'UnityEngine.InputSystem'
import { CallbackContext } from 'UnityEngine.InputSystem.InputAction';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class DragInputControls extends ZepetoScriptBehaviour {
    public static instance:DragInputControls;
    
    public PickupMesh:GameObject;
    public Camera:Camera;
    public myGO:GameObject;

    public DragInputControls:PlayerInput;
    private _continueTouch:Coroutine;

    public Start() {
        this.DragInputControls.actions.FindActionMap("Touch").FindAction("PrimaryContact").started += this.StartTouch;
        this.DragInputControls.actions.FindActionMap("Touch").FindAction("PrimaryContact").canceled += this.EndTouch;
    }

    public StartTouch(context:CallbackContext) {
        let position:Vector2 = <Vector2>this.DragInputControls.actions.FindActionMap("Touch").FindAction("PrimaryPosition").ReadValueAsObject();

        this.TryFindObjectToPickup(position);

        this._continueTouch = this.StartCoroutine(this.ContinueTouch(context));
    }

    *ContinueTouch(context:CallbackContext) {
        while(true) {
            if (this.PickupMesh) {
                this.MovePickupObject();
            }
            yield new WaitForSeconds(Time.deltaTime);
        }
    }

    EndTouch(context:CallbackContext) {
        this.StopCoroutine(this._continueTouch);

        this.PickupMesh = null;
    }

    TryFindObjectToPickup(screenPosition:Vector2) {
        let ray = this.Camera.ScreenPointToRay(new Vector3(screenPosition.x, screenPosition.y, 0));
        let ref = $ref<RaycastHit>();

        if (Physics.Raycast(ray, ref, 1000)) {
            let hitInfo = $unref(ref);
            this.PickupMesh = hitInfo.collider.gameObject;
        }
    }

    MovePickupObject() {
        let positionToMoveTo:Vector3;
        let plane:Plane = new Plane(this.Camera.transform.forward, this.PickupMesh.transform.position);
        let screenPosition:Vector2 = <Vector2>this.DragInputControls.actions.FindActionMap("Touch").FindAction("PrimaryPosition").ReadValueAsObject();
        let ray = this.Camera.ScreenPointToRay(new Vector3(screenPosition.x, screenPosition.y, 0));
        let ref = $ref<number>();
        if (plane.Raycast(ray, ref)) {
            let hitInfo = $unref(ref);
            positionToMoveTo = ray.GetPoint(hitInfo);
        }

        this.PickupMesh.transform.position = positionToMoveTo;
    }
}