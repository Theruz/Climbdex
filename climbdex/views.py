import boardlib.api.aurora
import flask

import climbdex.db

blueprint = flask.Blueprint("view", __name__)


@blueprint.route("/")
def index():
    return flask.render_template(
        "boardSelection.html.j2",
    )


@blueprint.route("/filter")
def filter():
    board_name = flask.request.args.get("board")
    layout_id = flask.request.args.get("layout")
    size_id = flask.request.args.get("size")
    set_ids = flask.request.args.getlist("set")
    return flask.render_template(
        "filterSelection.html.j2",
        params=flask.request.args,
        board_name=board_name,
        layout_name=climbdex.db.get_data(
            board_name, "layout_name", {"layout_id": layout_id}
        )[0][0],
        size_name=climbdex.db.get_data(
            board_name, "size_name", {"layout_id": layout_id, "size_id": size_id}
        )[0][0],
        angles=climbdex.db.get_data(board_name, "angles", {"layout_id": layout_id}),
        grades=climbdex.db.get_data(board_name, "grades"),
        colors=climbdex.db.get_data(board_name, "colors", {"layout_id": layout_id}),
        **get_draw_board_kwargs(board_name, layout_id, size_id, set_ids),
    )


@blueprint.route("/results")
def results():
    board_name = flask.request.args.get("board")
    layout_id = flask.request.args.get("layout")
    size_id = flask.request.args.get("size")
    set_ids = flask.request.args.getlist("set")
    return flask.render_template(
        "results.html.j2",
        app_url=boardlib.api.aurora.WEB_HOSTS[board_name],
        colors=climbdex.db.get_data(board_name, "colors", {"layout_id": layout_id}),
        **get_draw_board_kwargs(
            board_name,
            layout_id,
            size_id,
            set_ids,
        ),
    )


@blueprint.route("/<board_name>/beta/<uuid>")
def beta(board_name, uuid):
    beta = climbdex.db.get_data(board_name, "beta", {"uuid": uuid})
    climb_name = climbdex.db.get_data(board_name, "climb", {"uuid": uuid})[0][0]
    return flask.render_template(
        "beta.html.j2",
        beta=beta,
        climb_name=climb_name,
    )


def get_draw_board_kwargs(board_name, layout_id, size_id, set_ids):
    images_to_holds = {}
    for set_id in set_ids:
        image_filename = climbdex.db.get_data(
            board_name,
            "image_filename",
            {"layout_id": layout_id, "size_id": size_id, "set_id": set_id},
        )[0][0]
        image_url = f"{boardlib.api.aurora.API_HOSTS[board_name]}/img/{image_filename}"
        images_to_holds[image_url] = climbdex.db.get_data(
            board_name, "holds", {"layout_id": layout_id, "set_id": set_id}
        )

    size_dimensions = climbdex.db.get_data(
        board_name, "size_dimensions", {"size_id": size_id}
    )[0]
    return {
        "images_to_holds": images_to_holds,
        "edge_left": size_dimensions[0],
        "edge_right": size_dimensions[1],
        "edge_bottom": size_dimensions[2],
        "edge_top": size_dimensions[3],
    }
