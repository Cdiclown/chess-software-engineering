import BigLabel from "../../../resources/js/Components/BigLabel.jsx";
import renderer from 'react-test-renderer';

it("text renders correctly", () => {

    const component = renderer.create(
        <BigLabel>Test2</BigLabel>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
